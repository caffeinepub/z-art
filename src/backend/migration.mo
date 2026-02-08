import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Int "mo:core/Int";

module {
  // Original ArtistProfile type (with "username" field)
  type OldArtistProfile = {
    id : Nat;
    profileName : Text;
    username : Text;
    bio : Text;
    website : Text;
    createdAt : Int;
  };

  // Original Artwork type, referencing OldArtistProfile
  type OldArtwork = {
    id : Nat;
    title : Text;
    description : Text;
    imageUrl : Text;
    price : Nat;
    artist : OldArtistProfile;
    createdAt : Int;
  };

  // Original ArtworkSubmission type, referencing OldArtistProfile and OldArtwork
  type OldArtworkSubmission = {
    id : Nat;
    artwork : OldArtwork;
    artistPrincipal : Principal;
    artist : OldArtistProfile;
    status : {
      #pending;
      #approved;
      #rejected;
    };
    submittedAt : Int;
    reviewedAt : ?Int;
  };

  // Original PurchaseInquiry type, referencing OldArtwork
  type OldPurchaseInquiry = {
    id : Nat;
    artworkId : Nat;
    artwork : OldArtwork;
    buyerName : Text;
    buyerEmail : Text;
    message : Text;
    createdAt : Int;
  };

  // Old actor type
  type OldActor = {
    artistProfiles : Map.Map<Principal, OldArtistProfile>;
    artworks : Map.Map<Nat, OldArtwork>;
    submissions : Map.Map<Nat, OldArtworkSubmission>;
    inquiries : Map.Map<Nat, OldPurchaseInquiry>;
  };

  // New ArtistProfile type (with "publicSiteUsername" field)
  type NewArtistProfile = {
    id : Nat;
    profileName : Text;
    publicSiteUsername : Text;
    bio : Text;
    website : Text;
    createdAt : Int;
  };

  // New Artwork type, referencing NewArtistProfile
  type NewArtwork = {
    id : Nat;
    title : Text;
    description : Text;
    imageUrl : Text;
    price : Nat;
    artist : NewArtistProfile;
    createdAt : Int;
  };

  // New ArtworkSubmission type, referencing NewArtistProfile and NewArtwork
  type NewArtworkSubmission = {
    id : Nat;
    artwork : NewArtwork;
    artistPrincipal : Principal;
    artist : NewArtistProfile;
    status : {
      #pending;
      #approved;
      #rejected;
    };
    submittedAt : Int;
    reviewedAt : ?Int;
  };

  // New PurchaseInquiry type, referencing NewArtwork
  type NewPurchaseInquiry = {
    id : Nat;
    artworkId : Nat;
    artwork : NewArtwork;
    buyerName : Text;
    buyerEmail : Text;
    message : Text;
    createdAt : Int;
  };

  // New actor type
  type NewActor = {
    artistProfiles : Map.Map<Principal, NewArtistProfile>;
    artworks : Map.Map<Nat, NewArtwork>;
    submissions : Map.Map<Nat, NewArtworkSubmission>;
    inquiries : Map.Map<Nat, NewPurchaseInquiry>;
  };

  // Helper function to convert OldArtistProfile to NewArtistProfile
  func convertArtistProfile(old : OldArtistProfile) : NewArtistProfile {
    {
      id = old.id;
      profileName = old.profileName;
      publicSiteUsername = old.username;
      bio = old.bio;
      website = old.website;
      createdAt = old.createdAt;
    };
  };

  // Helper function to convert OldArtwork to NewArtwork
  func convertArtwork(old : OldArtwork) : NewArtwork {
    {
      id = old.id;
      title = old.title;
      description = old.description;
      imageUrl = old.imageUrl;
      price = old.price;
      artist = convertArtistProfile(old.artist);
      createdAt = old.createdAt;
    };
  };

  // Helper function to convert OldArtworkSubmission to NewArtworkSubmission
  func convertArtworkSubmission(old : OldArtworkSubmission) : NewArtworkSubmission {
    {
      id = old.id;
      artwork = convertArtwork(old.artwork);
      artistPrincipal = old.artistPrincipal;
      artist = convertArtistProfile(old.artist);
      status = old.status;
      submittedAt = old.submittedAt;
      reviewedAt = old.reviewedAt;
    };
  };

  // Helper function to convert OldPurchaseInquiry to NewPurchaseInquiry
  func convertPurchaseInquiry(old : OldPurchaseInquiry) : NewPurchaseInquiry {
    {
      id = old.id;
      artworkId = old.artworkId;
      artwork = convertArtwork(old.artwork);
      buyerName = old.buyerName;
      buyerEmail = old.buyerEmail;
      message = old.message;
      createdAt = old.createdAt;
    };
  };

  // Migration function to convert all fields containing old references
  public func run(old : OldActor) : NewActor {
    {
      artistProfiles = old.artistProfiles.map<Principal, OldArtistProfile, NewArtistProfile>(
        func(_principal, artist) { convertArtistProfile(artist) }
      );
      artworks = old.artworks.map<Nat, OldArtwork, NewArtwork>(
        func(_k, artwork) { convertArtwork(artwork) }
      );
      submissions = old.submissions.map<Nat, OldArtworkSubmission, NewArtworkSubmission>(
        func(_k, submission) { convertArtworkSubmission(submission) }
      );
      inquiries = old.inquiries.map<Nat, OldPurchaseInquiry, NewPurchaseInquiry>(
        func(_k, inquiry) { convertPurchaseInquiry(inquiry) }
      );
    };
  };
};
