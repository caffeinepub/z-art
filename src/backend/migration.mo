import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import AccessControl "authorization/access-control";

module {
  public type OldUserProfile = {
    name : Text;
    email : ?Text;
    bio : Text;
    avatar : ?Text;
  };

  public type OldArtistProfile = {
    id : Nat;
    profileName : Text;
    publicSiteUsername : Text;
    bio : Text;
    website : Text;
    createdAt : Int;
  };

  public type OldArtwork = {
    id : Nat;
    title : Text;
    description : Text;
    imageUrl : Text;
    price : Nat;
    artist : OldArtistProfile;
    createdAt : Int;
    sold : Bool;
  };

  public type OldArtworkSubmission = {
    id : Nat;
    artwork : OldArtwork;
    artistPrincipal : Principal;
    artist : OldArtistProfile;
    status : OldSubmissionStatus;
    submittedAt : Int;
    reviewedAt : ?Int;
  };

  public type OldPurchaseInquiry = {
    id : Nat;
    artworkId : Nat;
    artwork : OldArtwork;
    buyerName : Text;
    buyerEmail : Text;
    message : Text;
    createdAt : Int;
  };

  public type OldSubmissionStatus = {
    #pending;
    #approved;
    #rejected;
  };

  public type OldActor = {
    userProfiles : Map.Map<Principal, OldUserProfile>;
    artistProfiles : Map.Map<Principal, OldArtistProfile>;
    artworks : Map.Map<Nat, OldArtwork>;
    submissions : Map.Map<Nat, OldArtworkSubmission>;
    inquiries : Map.Map<Nat, OldPurchaseInquiry>;
    nextArtworkId : Nat;
    nextSubmissionId : Nat;
    nextInquiryId : Nat;
    accessControlState : AccessControl.AccessControlState;
  };

  public type NewUserProfile = OldUserProfile;
  public type NewArtistProfile = OldArtistProfile;
  public type NewArtwork = OldArtwork;
  public type NewArtworkSubmission = OldArtworkSubmission;
  public type NewPurchaseInquiry = OldPurchaseInquiry;
  public type NewSubmissionStatus = OldSubmissionStatus;

  public type NewActor = {
    userProfiles : Map.Map<Principal, NewUserProfile>;
    artistProfiles : Map.Map<Principal, NewArtistProfile>;
    artworks : Map.Map<Nat, NewArtwork>;
    submissions : Map.Map<Nat, NewArtworkSubmission>;
    inquiries : Map.Map<Nat, NewPurchaseInquiry>;
    nextArtworkId : Nat;
    nextSubmissionId : Nat;
    nextInquiryId : Nat;
    accessControlState : AccessControl.AccessControlState;
  };

  public func run(old : OldActor) : NewActor {
    old;
  };
};
