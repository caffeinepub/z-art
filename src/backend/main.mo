import Map "mo:core/Map";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Array "mo:core/Array";
import Principal "mo:core/Principal";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Migration "migration";

(with migration = Migration.run)
actor {
  public type UserProfile = {
    name : Text;
    email : ?Text;
    bio : Text;
    avatar : ?Text;
  };

  public type ArtistProfile = {
    id : Nat;
    profileName : Text;
    publicSiteUsername : Text;
    bio : Text;
    website : Text;
    createdAt : Int;
  };

  public type PublicArtistProfile = {
    id : Nat;
    publicSiteUsername : Text;
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
    sold : Bool;
  };

  public type PublicArtwork = {
    id : Nat;
    title : Text;
    description : Text;
    imageUrl : Text;
    price : Nat;
    artist : PublicArtistProfile;
    createdAt : Int;
    sold : Bool;
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

  public type PublicPurchaseInquiry = {
    id : Nat;
    artworkId : Nat;
    artwork : PublicArtwork;
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

  var accessControlState : AccessControl.AccessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  func toPublicArtistProfile(profile : ArtistProfile) : PublicArtistProfile {
    {
      id = profile.id;
      publicSiteUsername = profile.publicSiteUsername;
      bio = profile.bio;
      website = profile.website;
      createdAt = profile.createdAt;
    };
  };

  func toPublicArtwork(artwork : Artwork) : PublicArtwork {
    {
      id = artwork.id;
      title = artwork.title;
      description = artwork.description;
      imageUrl = artwork.imageUrl;
      price = artwork.price;
      artist = toPublicArtistProfile(artwork.artist);
      createdAt = artwork.createdAt;
      sold = artwork.sold;
    };
  };

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

  public shared ({ caller }) func createArtistProfile(
    profileName : Text,
    publicSiteUsername : Text,
    bio : Text,
    website : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create artist profiles");
    };

    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("You must have an existing user profile before creating an artist profile") };
      case (?_) {};
    };

    for ((_principal, profile) in artistProfiles.entries()) {
      if (profile.publicSiteUsername == publicSiteUsername) {
        Runtime.trap("Username already taken. Please choose a different one.");
      };
    };

    let newProfile : ArtistProfile = {
      id = artistProfiles.size() + 1;
      profileName;
      publicSiteUsername;
      bio;
      website;
      createdAt = Time.now();
    };
    artistProfiles.add(caller, newProfile);
  };

  public shared ({ caller }) func updateArtistProfile(
    newProfileName : Text,
    newPublicSiteUsername : Text,
    newBio : Text,
    newWebsite : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update artist profiles");
    };

    let maybeUserProfile = userProfiles.get(caller);
    switch (maybeUserProfile) {
      case (null) { Runtime.trap("You must have a user profile to update artist profiles") };
      case (?_) {};
    };

    for ((principal, profile) in artistProfiles.entries()) {
      if (profile.publicSiteUsername == newPublicSiteUsername and principal != caller) {
        Runtime.trap("Username already taken. Please choose a different one.");
      };
    };

    let existingProfile = switch (artistProfiles.get(caller)) {
      case (null) { Runtime.trap("Artist profile does not exist. Please create one first.") };
      case (?profile) { profile };
    };

    let updatedProfile : ArtistProfile = {
      id = existingProfile.id;
      profileName = newProfileName;
      publicSiteUsername = newPublicSiteUsername;
      bio = newBio;
      website = newWebsite;
      createdAt = existingProfile.createdAt;
    };

    artistProfiles.add(caller, updatedProfile);

    let updatedArtworks = artworks.map<Nat, Artwork, Artwork>(
      func(_id, artwork) {
        if (artwork.artist.id == existingProfile.id) {
          {
            id = artwork.id;
            title = artwork.title;
            description = artwork.description;
            imageUrl = artwork.imageUrl;
            price = artwork.price;
            artist = updatedProfile;
            createdAt = artwork.createdAt;
            sold = artwork.sold;
          };
        } else {
          artwork;
        };
      }
    );
    artworks.clear();
    for ((k, v) in updatedArtworks.entries()) {
      artworks.add(k, v);
    };

    let updatedSubmissions = submissions.map<Nat, ArtworkSubmission, ArtworkSubmission>(
      func(_id, sub) {
        if (sub.artist.id == existingProfile.id) {
          {
            id = sub.id;
            artwork = {
              id = sub.artwork.id;
              title = sub.artwork.title;
              description = sub.artwork.description;
              imageUrl = sub.artwork.imageUrl;
              price = sub.artwork.price;
              artist = updatedProfile;
              createdAt = sub.artwork.createdAt;
              sold = sub.artwork.sold;
            };
            artistPrincipal = sub.artistPrincipal;
            artist = updatedProfile;
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

    let updatedInquiries = inquiries.map<Nat, PurchaseInquiry, PurchaseInquiry>(
      func(_id, inquiry) {
        if (inquiry.artwork.artist.id == existingProfile.id) {
          {
            id = inquiry.id;
            artworkId = inquiry.artworkId;
            artwork = {
              id = inquiry.artwork.id;
              title = inquiry.artwork.title;
              description = inquiry.artwork.description;
              imageUrl = inquiry.artwork.imageUrl;
              price = inquiry.artwork.price;
              artist = updatedProfile;
              createdAt = inquiry.artwork.createdAt;
              sold = inquiry.artwork.sold;
            };
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

  public query ({ caller }) func getArtistProfileByCaller() : async ArtistProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view their artist profile");
    };

    switch (artistProfiles.get(caller)) {
      case (null) { Runtime.trap("Artist profile does not exist") };
      case (?profile) { profile };
    };
  };

  public query func getArtistProfiles() : async [PublicArtistProfile] {
    let publicProfiles = artistProfiles.values().map(toPublicArtistProfile);
    publicProfiles.toArray();
  };

  public shared ({ caller }) func submitArtwork(
    title : Text,
    description : Text,
    imageUrl : Text,
    price : Nat,
  ) : async SubmissionResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can submit artworks");
    };

    let maybeUserProfile = userProfiles.get(caller);
    switch (maybeUserProfile) {
      case (null) { Runtime.trap("You must have a user profile to submit artwork") };
      case (?_) {};
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
      sold = false;
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

    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("You must have an existing user profile to edit artworks") };
      case (?_) {};
    };

    let existingArtwork = switch (artworks.get(artworkId)) {
      case (null) { Runtime.trap("Artwork does not exist") };
      case (?artwork) { artwork };
    };

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

    if (submission.artistPrincipal != caller) {
      Runtime.trap("Unauthorized: Only the original artist can edit this artwork");
    };

    let updatedArtwork : Artwork = {
      id = existingArtwork.id;
      title = newTitle;
      description = newDescription;
      imageUrl = newImageUrl;
      price = newPrice;
      artist = existingArtwork.artist;
      createdAt = existingArtwork.createdAt;
      sold = existingArtwork.sold;
    };

    artworks.add(artworkId, updatedArtwork);

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

    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("You must have an existing user profile to delete artworks") };
      case (?_) {};
    };

    switch (artworks.get(artworkId)) {
      case (null) { Runtime.trap("Artwork does not exist") };
      case (?_) {
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

        if (submission.artistPrincipal != caller) {
          Runtime.trap("Unauthorized: Only the original artist can delete this artwork");
        };

        artworks.remove(artworkId);

        let filteredSubmissions = submissions.filter(
          func(_id, sub) {
            sub.artwork.id != artworkId;
          }
        );
        submissions.clear();
        for ((k, v) in filteredSubmissions.entries()) {
          submissions.add(k, v);
        };

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

  public shared ({ caller }) func toggleArtworkSoldStatus(artworkId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can change artwork sold status");
    };

    let maybeUserProfile = userProfiles.get(caller);
    switch (maybeUserProfile) {
      case (null) { Runtime.trap("You must have a user profile to change artwork sold status") };
      case (?_) {};
    };

    let artwork = switch (artworks.get(artworkId)) {
      case (null) { Runtime.trap("Artwork does not exist") };
      case (?artwork) { artwork };
    };

    let submission = switch (findSubmissionByArtworkId(artworkId)) {
      case (null) { Runtime.trap("Submission not found for this artwork") };
      case (?sub) { sub };
    };

    if (submission.artistPrincipal != caller) {
      Runtime.trap("Unauthorized: Only the original artist can change the sold status of this artwork");
    };

    let updatedArtwork : Artwork = {
      artwork with sold = not artwork.sold;
    };

    artworks.add(artworkId, updatedArtwork);

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
  };

  func findSubmissionByArtworkId(artworkId : Nat) : ?ArtworkSubmission {
    for (submission in submissions.values()) {
      if (submission.artwork.id == artworkId) {
        return ?submission;
      };
    };
    null;
  };

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

  public query ({ caller }) func getAllSubmissions() : async [ArtworkSubmission] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all submissions");
    };
    submissions.values().toArray();
  };

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

  public query func getArtworkById(artworkId : Nat) : async PublicArtwork {
    switch (artworks.get(artworkId)) {
      case (null) { Runtime.trap("Artwork does not exist") };
      case (?artwork) { toPublicArtwork(artwork) };
    };
  };

  public query func getArtworks() : async [PublicArtwork] {
    let publicArtworks = artworks.values().map(toPublicArtwork);
    publicArtworks.toArray();
  };

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

  public query ({ caller }) func getPurchaseInquiry(inquiryId : Nat) : async PurchaseInquiry {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view purchase inquiries");
    };

    switch (inquiries.get(inquiryId)) {
      case (null) { Runtime.trap("Purchase inquiry does not exist") };
      case (?inquiry) { inquiry };
    };
  };

  public query ({ caller }) func getAllPurchaseInquiries() : async [PurchaseInquiry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all purchase inquiries");
    };
    inquiries.values().toArray();
  };

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
      profileName = "Jane Doe";
      publicSiteUsername = "janedoe";
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
      sold = false;
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
