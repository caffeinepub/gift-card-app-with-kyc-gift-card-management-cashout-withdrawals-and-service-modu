import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Time "mo:core/Time";

module {
  type PayoutMethodId = Nat;
  type WithdrawalRequestId = Nat;
  type WithdrawalStatus = {
    #pending;
    #paid;
    #rejected;
  };

  type PayoutMethod = {
    id : PayoutMethodId;
    owner : Principal.Principal;
    bankName : Text;
    accountNumber : Text;
    accountName : Text;
    created : Time.Time;
  };

  type WithdrawalRequest = {
    id : WithdrawalRequestId;
    owner : Principal.Principal;
    payoutMethodId : PayoutMethodId;
    amount : Nat;
    status : WithdrawalStatus;
    created : Time.Time;
    processedBy : ?Principal.Principal;
    processedAt : ?Time.Time;
  };

  type OldActor = {};
  type NewActor = {
    _nextPayoutMethodId : PayoutMethodId;
    _nextWithdrawalRequestId : WithdrawalRequestId;
    payoutMethods : Map.Map<PayoutMethodId, PayoutMethod>;
    withdrawalRequests : Map.Map<WithdrawalRequestId, WithdrawalRequest>;
  };

  public func run(_ : OldActor) : NewActor {
    {
      _nextPayoutMethodId = 0;
      _nextWithdrawalRequestId = 0;
      payoutMethods = Map.empty<PayoutMethodId, PayoutMethod>();
      withdrawalRequests = Map.empty<WithdrawalRequestId, WithdrawalRequest>();
    };
  };
};
