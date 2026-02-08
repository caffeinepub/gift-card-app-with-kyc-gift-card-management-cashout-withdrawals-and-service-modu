import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Int "mo:core/Int";

import MixinAuthorization "authorization/MixinAuthorization";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";

actor {
  public type UserProfile = {
    name : Text;
  };

  public type PayoutMethodId = Nat;
  public type WithdrawalRequestId = Nat;
  public type KycRecordId = Nat;
  public type GiftCardRateId = Nat;

  type DocumentType = {
    #driversLicense;
    #passport;
    #votersID;
    #nationalID;
  };

  public type WithdrawalStatus = {
    #pending;
    #paid;
    #rejected;
  };

  public type KycRecord = {
    id : KycRecordId;
    user : Principal;
    documentURI : Text;
    documentType : DocumentType;
    idNumber : Text;
    status : KycStatus;
    signature : ?Storage.ExternalBlob;
    submittedAt : Time.Time;
    verifiedAt : ?Time.Time;
  };

  public type KycStatus = {
    #pending;
    #unverified;
    #verified;
    #expired;
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

  public type GiftCardRateStatus = {
    #active;
    #inactive;
  };

  public type GiftCardRate = {
    id : GiftCardRateId;
    brandName : Text;
    ratePercentage : Nat;
    status : GiftCardRateStatus;
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  public type RateQuote = {
    id : Nat;
    brandName : Text;
    ratePercentage : Nat;
    coinPriceIndex : Int;
    effectiveRate : Nat;
    createdAt : Time.Time;
  };

  var _nextKycRecordId : KycRecordId = 0;
  var _nextPayoutMethodId : PayoutMethodId = 0;
  var _nextWithdrawalRequestId : WithdrawalRequestId = 0;
  var _nextGiftCardRateId : GiftCardRateId = 0;
  var _nextRateQuoteId : Nat = 0;

  var _coinPriceIndex : Int = 100;

  let rateQuotes = Map.empty<Nat, RateQuote>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let payoutMethods = Map.empty<PayoutMethodId, PayoutMethod>();
  let withdrawalRequests = Map.empty<WithdrawalRequestId, WithdrawalRequest>();
  let kycRecords = Map.empty<KycRecordId, KycRecord>();
  let giftCardRates = Map.empty<GiftCardRateId, GiftCardRate>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // KYC
  public shared ({ caller }) func submitKycRecord(documentType : DocumentType, idNumber : Text, documentURI : Text, signature : ?Storage.ExternalBlob) : async KycRecordId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit KYC records");
    };

    let recordId = _nextKycRecordId;
    _nextKycRecordId += 1;

    let kycRecord : KycRecord = {
      id = recordId;
      user = caller;
      documentType;
      idNumber;
      documentURI;
      status = #pending;
      signature;
      submittedAt = Time.now();
      verifiedAt = null;
    };

    kycRecords.add(recordId, kycRecord);
    recordId;
  };

  public query ({ caller }) func getKycStatus() : async [KycRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Insufficient permissions: Only users can get their KYC status");
    };

    kycRecords.values().filter(
      func(record) {
        record.user == caller;
      }
    ).toArray();
  };

  public query ({ caller }) func getUserKycRecords(user : Principal) : async [KycRecord] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    kycRecords.values().filter(
      func(record) {
        record.user == user;
      }
    ).toArray();
  };

  public shared ({ caller }) func updateKycStatus(recordId : KycRecordId, status : KycStatus) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    let record = switch (kycRecords.get(recordId)) {
      case (?record) {
        switch (record.status) {
          case (#expired) {
            Runtime.trap("Invalid KYC record: already expired");
          };
          case (#pending) {
            { record with
              status;
              verifiedAt = ?Time.now();
            };
          };
          case (_) {
            { record with status };
          };
        };
      };
      case (null) {
        Runtime.trap("Invalid KYC record: not found");
      };
    };

    kycRecords.add(recordId, record);
  };

  // KYC VERIFICATION HELPER
  func isUserKycVerified(user : Principal) : Bool {
    let userKycRecords = kycRecords.values().filter(
      func(record) { record.user == user }
    ).toArray();

    if (userKycRecords.size() <= 0) {
      return false;
    };

    let latestRecord = userKycRecords.foldLeft(?userKycRecords[0], func(acc, record) { ?record });

    switch (latestRecord) {
      case (?record) {
        switch (record.status) {
          case (#verified) { true };
          case (_) { false };
        };
      };
      case (null) { false };
    };
  };

  // NEW ENDPOINT: Returns whether authenticated user currently has a valid KYC record
  public query ({ caller }) func isCallerKycVerified() : async Bool {
    isUserKycVerified(caller);
  };

  // USER PROFILE
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

  // PAYOUT METHODS
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

  // WITHDRAWALS
  public shared ({ caller }) func createWithdrawalRequest(payoutMethodId : PayoutMethodId, amount : Nat) : async WithdrawalRequestId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create withdrawal requests");
    };

    if (not isUserKycVerified(caller)) {
      Runtime.trap("Withdrawal denied: User has not passed KYC verification");
    };

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

    let request : WithdrawalRequest = {
      id = requestId;
      owner = caller;
      payoutMethodId;
      amount;
      status = #pending;
      created = Time.now();
      processedBy = null;
      processedAt = null;
    };

    withdrawalRequests.add(requestId, request);
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

  // ADMIN OPERATIONS
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

    let updatedRequest = switch (withdrawalRequests.get(requestId)) {
      case (?oldRequest) {
        if (oldRequest.status != #pending) {
          Runtime.trap("Invalid withdrawal request: request is not pending");
        };

        { oldRequest with
          status;
          processedAt = ?Time.now();
          processedBy = ?caller;
        };
      };
      case (null) { Runtime.trap("Invalid withdrawal request: Not found") };
    };

    withdrawalRequests.add(requestId, updatedRequest);
  };

  // GIFT CARD RATES CRUD
  public shared ({ caller }) func createGiftCardRate(brandName : Text, ratePercentage : Nat) : async GiftCardRateId {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can create gift card rates");
    };

    let rateId = _nextGiftCardRateId;
    _nextGiftCardRateId += 1;

    let rate : GiftCardRate = {
      id = rateId;
      brandName;
      ratePercentage;
      status = #active;
      createdAt = Time.now();
      updatedAt = Time.now();
    };

    giftCardRates.add(rateId, rate);
    rateId;
  };

  public shared ({ caller }) func updateGiftCardRate(rateId : GiftCardRateId, ratePercentage : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update gift card rates");
    };

    let updatedRate = switch (giftCardRates.get(rateId)) {
      case (?oldRate) {
        { oldRate with
          ratePercentage;
          updatedAt = Time.now();
        };
      };
      case (null) { Runtime.trap("Invalid rate: Not found") };
    };

    giftCardRates.add(rateId, updatedRate);
  };

  public shared ({ caller }) func setGiftCardRateStatus(rateId : GiftCardRateId, status : { #active; #inactive }) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update rate status");
    };

    let updatedRate = switch (giftCardRates.get(rateId)) {
      case (?oldRate) {
        { oldRate with
          status;
          updatedAt = Time.now();
        };
      };
      case (null) { Runtime.trap("Invalid rate: Not found") };
    };

    giftCardRates.add(rateId, updatedRate);
  };

  // Price Index
  public shared ({ caller }) func setCoinPriceIndex(priceIndex : Int) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    _coinPriceIndex := priceIndex;
  };

  public query ({ caller }) func getCoinPriceIndex() : async Int {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view coin price index");
    };
    _coinPriceIndex;
  };

  public query ({ caller }) func getAllRates() : async [GiftCardRate] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view gift card rates");
    };
    giftCardRates.values().toArray();
  };

  public query ({ caller }) func getActiveRateForBrand(brandName : Text) : async ?Int {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view gift card rates");
    };

    let activeRates = giftCardRates.values().filter(
      func(rate) { rate.brandName == brandName and rate.status == #active }
    ).toArray();

    if (activeRates.size() == 0) {
      null;
    } else {
      ?((activeRates[activeRates.size() - 1].ratePercentage * _coinPriceIndex) / 100);
    };
  };

  public query ({ caller }) func listActiveRates() : async [GiftCardRate] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view gift card rates");
    };

    giftCardRates.values().filter(
      func(rate) { rate.status == #active }
    ).toArray();
  };

  public shared ({ caller }) func generateRateQuote(brandName : Text, ratePercentage : Nat) : async RateQuote {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can generate rate quotes");
    };

    let quoteId = _nextRateQuoteId;
    _nextRateQuoteId += 1;

    let effectiveRate = (ratePercentage * _coinPriceIndex.toNat()) / 100;

    let newQuote : RateQuote = {
      id = quoteId;
      brandName;
      ratePercentage;
      coinPriceIndex = _coinPriceIndex;
      effectiveRate;
      createdAt = Time.now();
    };

    rateQuotes.add(quoteId, newQuote);
    newQuote;
  };

  public shared ({ caller }) func calculatePayout(quoteId : Nat, amount : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can calculate payouts");
    };

    switch (rateQuotes.get(quoteId)) {
      case (null) { Runtime.trap("Invalid quote: Not found") };
      case (?quote) { (amount * quote.effectiveRate) / 100 };
    };
  };
};
