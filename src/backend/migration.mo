import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Time "mo:core/Time";

module {
  type KycRecordId = Nat;

  type DocumentType = {
    #driversLicense;
    #passport;
    #votersID;
    #nationalID;
  };

  type KycStatus = {
    #pending;
    #unverified;
    #verified;
    #expired;
    #rejected;
  };

  type KycRecord = {
    id : KycRecordId;
    user : Principal;
    documentURI : Text;
    documentType : DocumentType;
    idNumber : Text;
    status : KycStatus;
    submittedAt : Time.Time;
    verifiedAt : ?Time.Time;
  };

  type OldActor = {};

  type NewActor = {
    kycRecords : Map.Map<Nat, KycRecord>;
    _nextKycRecordId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    { kycRecords = Map.empty<Nat, KycRecord>(); _nextKycRecordId = 0 };
  };
};
