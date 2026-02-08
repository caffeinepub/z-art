import Map "mo:core/Map";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Array "mo:core/Array";
import Order "mo:core/Order";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";



actor {
  public type UserProfile = {
    name : Text;
    email : ?Text;
    bio : Text;
    avatar : ?Text;
  };

  public type ArtistProfile = {
    id : Nat;
    name : Text;
    bio : Text;
    website : Text;
    createdAt : Int;
  };

  public type SubmissionResult = {
    submissionId : Nat;
  };

  public type Artwork = {
    id : Nat;
    title : Text;
    description : Text;
    imageUrl : Text;
    price : Nat;
    artist : ArtistProfile;
    createdAt : Int;
  };

  public type SubmissionStatus = {
    #pending;
    #approved;
    #rejected;
  };

  module SubmissionStatus {
    public func compare(s1 : SubmissionStatus, s2 : SubmissionStatus) : Order.Order {
      func toNat(status : SubmissionStatus) : Nat {
        switch (status) {
          case (#pending) { 0 };
          case (#approved) { 1 };
          case (#rejected) { 2 };
        };
      };
      Nat.compare(toNat(s1), toNat(s2));
    };

    public func toText(status : SubmissionStatus) : Text {
      switch (status) {
        case (#pending) { "pending" };
        case (#approved) { "approved" };
        case (#rejected) { "rejected" };
      };
    };
  };

  public type ArtworkSubmission = {
    id : Nat;
    artwork : Artwork;
    artistPrincipal : Principal;
    artist : ArtistProfile;
    status : SubmissionStatus;
    submittedAt : Int;
    reviewedAt : ?Int;
  };

  public type PurchaseInquiry = {
    id : Nat;
    artworkId : Nat;
    artwork : Artwork;
    buyerName : Text;
    buyerEmail : Text;
    message : Text;
    createdAt : Int;
  };

  var userProfiles : Map.Map<Principal, UserProfile> = Map.empty<Principal, UserProfile>();
  var artistProfiles : Map.Map<Principal, ArtistProfile> = Map.empty<Principal, ArtistProfile>();
  var artworks : Map.Map<Nat, Artwork> = Map.empty<Nat, Artwork>();
  var submissions : Map.Map<Nat, ArtworkSubmission> = Map.empty<Nat, ArtworkSubmission>();
  var inquiries : Map.Map<Nat, PurchaseInquiry> = Map.empty<Nat, PurchaseInquiry>();

  var nextArtworkId : Nat = 1;
  var nextSubmissionId : Nat = 1;
  var nextInquiryId : Nat = 1;

  let accessControlState : AccessControl.AccessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Management (required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Artist Profile Management
  public shared ({ caller }) func createArtistProfile(
    name : Text,
    bio : Text,
    website : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create artist profiles");
    };

    let profile : ArtistProfile = {
      id = artistProfiles.size() + 1;
      name;
      bio;
      website;
      createdAt = Time.now();
    };
    artistProfiles.add(caller, profile);
  };

  public query ({ caller }) func getArtistProfileByCaller() : async ArtistProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view their artist profile");
    };

    switch (artistProfiles.get(caller)) {
      case (null) { Runtime.trap("Artist profile does not exist") };
      case (?profile) { profile };
    };
  };

  public query func getArtistProfiles() : async [ArtistProfile] {
    artistProfiles.values().toArray();
  };

  // Artwork Submission
  public shared ({ caller }) func submitArtwork(
    title : Text,
    description : Text,
    imageUrl : Text,
    price : Nat,
  ) : async SubmissionResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can submit artworks");
    };

    let artistProfile = switch (artistProfiles.get(caller)) {
      case (null) { Runtime.trap("Artist profile does not exist. Please create an artist profile first.") };
      case (?profile) { profile };
    };

    let artwork : Artwork = {
      id = nextArtworkId;
      title;
      description;
      imageUrl;
      price;
      artist = artistProfile;
      createdAt = Time.now();
    };

    let submission : ArtworkSubmission = {
      id = nextSubmissionId;
      artwork;
      artistPrincipal = caller;
      artist = artistProfile;
      status = #pending;
      submittedAt = Time.now();
      reviewedAt = null;
    };

    submissions.add(nextSubmissionId, submission);
    artworks.add(nextArtworkId, artwork);

    nextArtworkId += 1;
    nextSubmissionId += 1;

    {
      submissionId = nextSubmissionId - 1;
    };
  };

  // Edit Artwork
  public shared ({ caller }) func editArtwork(
    artworkId : Nat,
    newTitle : Text,
    newDescription : Text,
    newImageUrl : Text,
    newPrice : Nat,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can edit artworks");
    };

    let existingArtwork = switch (artworks.get(artworkId)) {
      case (null) { Runtime.trap("Artwork does not exist") };
      case (?artwork) { artwork };
    };

    // Find the submission for this artwork to verify ownership
    var foundSubmission : ?ArtworkSubmission = null;
    for (submission in submissions.values()) {
      if (submission.artwork.id == artworkId) {
        foundSubmission := ?submission;
      };
    };

    let submission = switch (foundSubmission) {
      case (null) { Runtime.trap("Submission not found for this artwork") };
      case (?sub) { sub };
    };

    // Verify that the caller is the original artist who submitted the artwork
    if (submission.artistPrincipal != caller) {
      Runtime.trap("Unauthorized: Only the original artist can edit this artwork");
    };

    // Create the updated artwork
    let updatedArtwork : Artwork = {
      id = existingArtwork.id;
      title = newTitle;
      description = newDescription;
      imageUrl = newImageUrl;
      price = newPrice;
      artist = existingArtwork.artist;
      createdAt = existingArtwork.createdAt;
    };

    // Update the artwork in the artworks map
    artworks.add(artworkId, updatedArtwork);

    // Update submissions where the artwork is referenced
    let updatedSubmissions = submissions.map<Nat, ArtworkSubmission, ArtworkSubmission>(
      func(_id, sub) {
        if (sub.artwork.id == artworkId) {
          {
            id = sub.id;
            artwork = updatedArtwork;
            artistPrincipal = sub.artistPrincipal;
            artist = sub.artist;
            status = sub.status;
            submittedAt = sub.submittedAt;
            reviewedAt = sub.reviewedAt;
          };
        } else {
          sub;
        };
      }
    );
    submissions.clear();
    for ((k, v) in updatedSubmissions.entries()) {
      submissions.add(k, v);
    };

    // Update inquiries where the artwork is referenced
    let updatedInquiries = inquiries.map<Nat, PurchaseInquiry, PurchaseInquiry>(
      func(_id, inquiry) {
        if (inquiry.artwork.id == artworkId) {
          {
            id = inquiry.id;
            artworkId = inquiry.artworkId;
            artwork = updatedArtwork;
            buyerName = inquiry.buyerName;
            buyerEmail = inquiry.buyerEmail;
            message = inquiry.message;
            createdAt = inquiry.createdAt;
          };
        } else {
          inquiry;
        };
      }
    );
    inquiries.clear();
    for ((k, v) in updatedInquiries.entries()) {
      inquiries.add(k, v);
    };
  };

  public shared ({ caller }) func deleteArtwork(artworkId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can delete artworks");
    };

    switch (artworks.get(artworkId)) {
      case (null) { Runtime.trap("Artwork does not exist") };
      case (?_) {
        // Find the submission for this artwork to verify ownership
        var foundSubmission : ?ArtworkSubmission = null;
        for (submission in submissions.values()) {
          if (submission.artwork.id == artworkId) {
            foundSubmission := ?submission;
          };
        };

        let submission = switch (foundSubmission) {
          case (null) { Runtime.trap("Submission not found for this artwork") };
          case (?sub) { sub };
        };

        // Verify that the caller is the original artist who submitted the artwork or is an admin
        if (submission.artistPrincipal != caller and not (AccessControl.isAdmin(accessControlState, caller))) {
          Runtime.trap("Unauthorized: Only the original artist or an admin can delete this artwork");
        };

        // Remove the artwork from the artworks map
        artworks.remove(artworkId);

        // Remove all submissions related to this artwork
        let filteredSubmissions = submissions.filter(
          func(_id, sub) {
            sub.artwork.id != artworkId;
          }
        );
        submissions.clear();
        for ((k, v) in filteredSubmissions.entries()) {
          submissions.add(k, v);
        };

        // Remove all inquiries related to this artwork
        let filteredInquiries = inquiries.filter(
          func(_id, inquiry) {
            inquiry.artworkId != artworkId;
          }
        );
        inquiries.clear();
        for ((k, v) in filteredInquiries.entries()) {
          inquiries.add(k, v);
        };
      };
    };
  };

  // View own submissions
  public query ({ caller }) func getSubmissionsByCaller() : async [ArtworkSubmission] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view their submissions");
    };

    let callerSubmissions = submissions.values().filter(
      func(sub : ArtworkSubmission) : Bool {
        sub.artistPrincipal == caller
      }
    );
    callerSubmissions.toArray();
  };

  // Admin: View all submissions
  public query ({ caller }) func getAllSubmissions() : async [ArtworkSubmission] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all submissions");
    };
    submissions.values().toArray();
  };

  // Admin: Approve submission
  public shared ({ caller }) func approveSubmission(submissionId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can approve submissions");
    };

    let submission = switch (submissions.get(submissionId)) {
      case (null) { Runtime.trap("Submission does not exist") };
      case (?sub) { sub };
    };

    let updatedSubmission : ArtworkSubmission = {
      id = submission.id;
      artwork = submission.artwork;
      artistPrincipal = submission.artistPrincipal;
      artist = submission.artist;
      status = #approved;
      submittedAt = submission.submittedAt;
      reviewedAt = ?Time.now();
    };

    submissions.add(submissionId, updatedSubmission);
  };

  // Admin: Reject submission
  public shared ({ caller }) func rejectSubmission(submissionId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can reject submissions");
    };

    let submission = switch (submissions.get(submissionId)) {
      case (null) { Runtime.trap("Submission does not exist") };
      case (?sub) { sub };
    };

    let updatedSubmission : ArtworkSubmission = {
      id = submission.id;
      artwork = submission.artwork;
      artistPrincipal = submission.artistPrincipal;
      artist = submission.artist;
      status = #rejected;
      submittedAt = submission.submittedAt;
      reviewedAt = ?Time.now();
    };

    submissions.add(submissionId, updatedSubmission);
  };

  // Public: View artwork by ID
  public query func getArtworkById(artworkId : Nat) : async Artwork {
    switch (artworks.get(artworkId)) {
      case (null) { Runtime.trap("Artwork does not exist") };
      case (?artwork) { artwork };
    };
  };

  // Public: View all artworks
  public query func getArtworks() : async [Artwork] {
    artworks.values().toArray();
  };

  // Public: Create purchase inquiry (anyone can inquire)
  public shared func createPurchaseInquiry(artworkId : Nat, buyerName : Text, buyerEmail : Text, message : Text) : async () {
    let artwork = switch (artworks.get(artworkId)) {
      case (null) { Runtime.trap("Artwork does not exist") };
      case (?artwork) { artwork };
    };

    let inquiry : PurchaseInquiry = {
      id = nextInquiryId;
      artworkId;
      artwork;
      buyerName;
      buyerEmail;
      message;
      createdAt = Time.now();
    };

    inquiries.add(nextInquiryId, inquiry);
    nextInquiryId += 1;
  };

  // Admin: View specific inquiry
  public query ({ caller }) func getPurchaseInquiry(inquiryId : Nat) : async PurchaseInquiry {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view purchase inquiries");
    };

    switch (inquiries.get(inquiryId)) {
      case (null) { Runtime.trap("Purchase inquiry does not exist") };
      case (?inquiry) { inquiry };
    };
  };

  // Admin: View all inquiries
  public query ({ caller }) func getAllPurchaseInquiries() : async [PurchaseInquiry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all purchase inquiries");
    };
    inquiries.values().toArray();
  };

  // Admin: View inquiries for specific artwork
  public query ({ caller }) func getInquiriesByArtwork(artworkId : Nat) : async [PurchaseInquiry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view inquiries by artwork");
    };

    let artworkInquiries = inquiries.values().filter(
      func(inquiry : PurchaseInquiry) : Bool {
        inquiry.artworkId == artworkId
      }
    );
    artworkInquiries.toArray();
  };

  // Admin: Replace dataset with fresh hardcoded data
  public shared ({ caller }) func replaceDataset() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can replace the dataset");
    };

    userProfiles.clear();
    artistProfiles.clear();
    artworks.clear();
    submissions.clear();
    inquiries.clear();

    nextArtworkId := 1;
    nextSubmissionId := 1;
    nextInquiryId := 1;

    let now = Time.now();

    let artistProfile : ArtistProfile = {
      id = 1;
      name = "Jane Doe";
      bio = "Contemporary sculptor exploring digital and physical forms.";
      website = "www.janedoestudios.com";
      createdAt = now;
    };

    let artwork : Artwork = {
      id = 1;
      title = "Digital Dreamscape";
      description = "A fusion of digital art and 3D printed sculpture.";
      imageUrl = "https://example.com/janedoestudios";
      price = 15000;
      artist = artistProfile;
      createdAt = now;
    };

    let submission : ArtworkSubmission = {
      id = 1;
      artwork;
      artistPrincipal = Principal.anonymous();
      artist = artistProfile;
      status = #approved;
      submittedAt = now;
      reviewedAt = ?now;
    };

    artistProfiles.add(Principal.anonymous(), artistProfile);
    artworks.add(1, artwork);
    submissions.add(1, submission);

    nextArtworkId := 2;
    nextSubmissionId := 2;
    nextInquiryId := 1;
  };
};
