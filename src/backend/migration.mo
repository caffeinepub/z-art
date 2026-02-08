import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";

module {
  public type ArtistProfile = {
    id : Nat;
    name : Text;
    bio : Text;
    website : Text;
    createdAt : Int;
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

  public type Old = {
    userProfiles : Map.Map<Principal, { name : Text; email : Text; bio : Text; avatar : ?Text }>;
    artistProfiles : Map.Map<Principal, ArtistProfile>;
    artworks : Map.Map<Nat, Artwork>;
    submissions : Map.Map<Nat, ArtworkSubmission>;
    inquiries : Map.Map<Nat, PurchaseInquiry>;
    nextArtworkId : Nat;
    nextSubmissionId : Nat;
    nextInquiryId : Nat;
  };

  type New = {
    userProfiles : Map.Map<Principal, { name : Text; email : Text; bio : Text; avatar : ?Text }>;
    artistProfiles : Map.Map<Principal, ArtistProfile>;
    artworks : Map.Map<Nat, Artwork>;
    submissions : Map.Map<Nat, ArtworkSubmission>;
    inquiries : Map.Map<Nat, PurchaseInquiry>;
    nextArtworkId : Nat;
    nextSubmissionId : Nat;
    nextInquiryId : Nat;
  };

  public func run(old : Old) : New {
    {
      userProfiles = old.userProfiles;
      artistProfiles = old.artistProfiles;
      artworks = old.artworks;
      submissions = old.submissions;
      inquiries = old.inquiries;
      nextArtworkId = old.nextArtworkId;
      nextSubmissionId = old.nextSubmissionId;
      nextInquiryId = old.nextInquiryId;
    };
  };
};
