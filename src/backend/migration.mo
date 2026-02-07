import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  // Old UserProfile type without the avatar field
  type OldUserProfile = {
    name : Text;
    email : Text;
    bio : Text;
  };

  // Old actor type with userProfiles using the old UserProfile type
  type OldActor = {
    userProfiles : Map.Map<Principal, OldUserProfile>;
  };

  // New UserProfile type with optional avatar field
  type NewUserProfile = {
    name : Text;
    email : Text;
    bio : Text;
    avatar : ?Text; // New avatar field (data URL)
  };

  // New actor type with userProfiles using the new UserProfile type
  type NewActor = {
    userProfiles : Map.Map<Principal, NewUserProfile>;
  };

  // Migration function to add avatar field to all user profiles
  public func run(old : OldActor) : NewActor {
    let newUserProfiles = old.userProfiles.map<Principal, OldUserProfile, NewUserProfile>(
      // Map each old profile to new one with avatar set to null
      func(_id, oldProfile) {
        { oldProfile with avatar = null };
      }
    );
    { userProfiles = newUserProfiles };
  };
};
