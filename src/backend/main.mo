import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

// Apply migration logic on upgrade via with syntax.

actor {
  // Types
  public type PayoutMethodId = Nat;
  public type WithdrawalRequestId = Nat;

  // We currently support 'pending', 'paid', 'rejected'
  public type WithdrawalStatus = {
    #pending;
    #paid;
    #rejected;
  };

  public type PayoutMethod = {
    id : PayoutMethodId;
    owner : Principal;
    bankName : Text;
    accountNumber : Text;
    accountName : Text;
    created : Time.Time;
  };

  public type WithdrawalRequest = {
    id : WithdrawalRequestId;
    owner : Principal;
    payoutMethodId : PayoutMethodId;
    amount : Nat;
    status : WithdrawalStatus;
    created : Time.Time;
    processedBy : ?Principal;
    processedAt : ?Time.Time;
  };

  public type UserProfile = {
    name : Text;
  };

  // State for tracking methods and requests
  var _nextPayoutMethodId : PayoutMethodId = 0;
  var _nextWithdrawalRequestId : WithdrawalRequestId = 0;

  let payoutMethods = Map.empty<PayoutMethodId, PayoutMethod>();
  let withdrawalRequests = Map.empty<WithdrawalRequestId, WithdrawalRequest>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Initialize the access control and storage state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
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

  // Payout Method
  public shared ({ caller }) func createPayoutMethod(bankName : Text, accountNumber : Text, accountName : Text) : async PayoutMethodId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create payout methods");
    };

    let methodId = _nextPayoutMethodId;
    _nextPayoutMethodId += 1;

    let method : PayoutMethod = {
      id = methodId;
      owner = caller;
      bankName;
      accountNumber;
      accountName;
      created = Time.now();
    };

    payoutMethods.add(methodId, method);
    methodId;
  };

  public query ({ caller }) func listUserPayoutMethods() : async [PayoutMethod] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list payout methods");
    };
    payoutMethods.values().filter(
      func(method) { method.owner == caller }
    ).toArray();
  };

  // Withdrawals
  public shared ({ caller }) func createWithdrawalRequest(payoutMethodId : PayoutMethodId, amount : Nat) : async WithdrawalRequestId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create withdrawal requests");
    };

    // Verify payout method exists and belongs to caller
    switch (payoutMethods.get(payoutMethodId)) {
      case (null) { Runtime.trap("Invalid withdrawal request: Payout method not found") };
      case (?method) {
        if (method.owner != caller) {
          Runtime.trap("Unauthorized: Cannot create withdrawal for payout method owned by another user");
        };
      };
    };

    let requestId = _nextWithdrawalRequestId;
    _nextWithdrawalRequestId += 1;

    let newRequest : WithdrawalRequest = {
      id = requestId;
      owner = caller;
      payoutMethodId;
      amount;
      status = #pending; // Pending
      created = Time.now();
      processedBy = null;
      processedAt = null;
    };

    withdrawalRequests.add(requestId, newRequest);
    requestId;
  };

  public query ({ caller }) func listUserWithdrawals() : async [WithdrawalRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list withdrawal requests");
    };
    withdrawalRequests.values().filter(
      func(request) { request.owner == caller }
    ).toArray();
  };

  // Admin Operations
  public shared ({ caller }) func listPendingWithdrawals() : async [WithdrawalRequest] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    withdrawalRequests.values().filter(
      func(request) { request.status == #pending }
    ).toArray();
  };

  public shared ({ caller }) func updateWithdrawalStatus(requestId : WithdrawalRequestId, status : WithdrawalStatus) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    switch (withdrawalRequests.get(requestId)) {
      case (null) { Runtime.trap("Invalid withdrawal request: Not found") };
      case (?_request) { };
    };

    let updatedRequest = switch (withdrawalRequests.get(requestId)) {
      case (?oldRequest) {
        if (oldRequest.status != #pending) {
          Runtime.trap("Invalid withdrawal request: request is not pending");
        };
        { oldRequest with status; processedAt = ?Time.now(); processedBy = ?caller };
      };
      case (null) { Runtime.trap("Invalid withdrawal request: Not found") };
    };

    withdrawalRequests.add(requestId, updatedRequest);
  };
};
