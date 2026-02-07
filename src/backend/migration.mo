import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";

module {
  type UserProfile = {
    name : Text;
    email : Text;
    bio : Text;
    avatar : ?Text;
  };

  type ArtistProfile = {
    id : Nat;
    name : Text;
    bio : Text;
    website : Text;
    createdAt : Int;
  };

  type Artwork = {
    id : Nat;
    title : Text;
    description : Text;
    imageUrl : Text;
    price : Nat;
    artist : ArtistProfile;
    createdAt : Int;
  };

  type SubmissionStatus = {
    #pending;
    #approved;
    #rejected;
  };

  type ArtworkSubmission = {
    id : Nat;
    artwork : Artwork;
    artistPrincipal : Principal;
    artist : ArtistProfile;
    status : SubmissionStatus;
    submittedAt : Int;
    reviewedAt : ?Int;
  };

  type PurchaseInquiry = {
    id : Nat;
    artworkId : Nat;
    artwork : Artwork;
    buyerName : Text;
    buyerEmail : Text;
    message : Text;
    createdAt : Int;
  };

  type OldActor = {
    userProfiles : Map.Map<Principal, UserProfile>;
    artistProfiles : Map.Map<Principal, ArtistProfile>;
    artworks : Map.Map<Nat, Artwork>;
    submissions : Map.Map<Nat, ArtworkSubmission>;
    inquiries : Map.Map<Nat, PurchaseInquiry>;
    nextArtworkId : Nat;
    nextSubmissionId : Nat;
    nextInquiryId : Nat;
  };

  public func run(old : OldActor) : OldActor {
    old;
  };
};
