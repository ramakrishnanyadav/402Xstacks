;; x402-nexus-escrow.clar
;; Non-custodial escrow for x402 micropayments with auto-refund protection

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-not-found (err u100))
(define-constant err-unauthorized (err u101))
(define-constant err-already-claimed (err u102))
(define-constant err-already-refunded (err u103))
(define-constant err-not-expired (err u104))
(define-constant err-invalid-amount (err u105))
(define-constant err-duplicate-payment (err u106))

;; Timeout: 100 blocks (~16 minutes on Stacks)
(define-constant payment-timeout u100)

;; Data structures
(define-map payments
  { payment-id: (buff 32) }
  {
    sender: principal,
    recipient: principal,
    amount: uint,
    created-at: uint,
    claimed: bool,
    refunded: bool,
    metadata: (string-ascii 256)
  }
)

;; Analytics
(define-data-var total-payments-created uint u0)
(define-data-var total-payments-claimed uint u0)
(define-data-var total-payments-refunded uint u0)
(define-data-var total-volume uint u0)

;; Events tracking
(define-map payment-events
  { event-id: uint }
  {
    payment-id: (buff 32),
    event-type: (string-ascii 20),
    block-height: uint
  }
)
(define-data-var event-counter uint u0)

;; Create escrow payment
(define-public (create-payment 
    (payment-id (buff 32))
    (recipient principal)
    (amount uint)
    (metadata (string-ascii 256)))
  (begin
    ;; Validate amount
    (asserts! (> amount u0) err-invalid-amount)
    
    ;; Check for duplicate payment ID
    (asserts! (is-none (map-get? payments {payment-id: payment-id})) err-duplicate-payment)
    
    ;; Transfer STX from sender to contract
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
    
    ;; Store payment details
    (map-set payments 
      { payment-id: payment-id }
      {
        sender: tx-sender,
        recipient: recipient,
        amount: amount,
        created-at: block-height,
        claimed: false,
        refunded: false,
        metadata: metadata
      })
    
    ;; Update analytics
    (var-set total-payments-created (+ (var-get total-payments-created) u1))
    (var-set total-volume (+ (var-get total-volume) amount))
    
    ;; Emit event
    (try! (emit-event payment-id "CREATED"))
    
    (ok payment-id)
  )
)

;; Merchant claims payment after delivering service
(define-public (claim-payment (payment-id (buff 32)))
  (let ((payment (unwrap! (map-get? payments {payment-id: payment-id}) err-not-found)))
    ;; Validate authorization
    (asserts! (is-eq tx-sender (get recipient payment)) err-unauthorized)
    
    ;; Validate state
    (asserts! (not (get claimed payment)) err-already-claimed)
    (asserts! (not (get refunded payment)) err-already-refunded)
    
    ;; Transfer from contract to recipient
    (try! (as-contract (stx-transfer? 
      (get amount payment) 
      tx-sender 
      (get recipient payment))))
    
    ;; Mark as claimed
    (map-set payments 
      {payment-id: payment-id} 
      (merge payment {claimed: true}))
    
    ;; Update analytics
    (var-set total-payments-claimed (+ (var-get total-payments-claimed) u1))
    
    ;; Emit event
    (try! (emit-event payment-id "CLAIMED"))
    
    (ok true)
  )
)

;; Auto-refund if timeout expires and payment not claimed
(define-public (refund-expired (payment-id (buff 32)))
  (let ((payment (unwrap! (map-get? payments {payment-id: payment-id}) err-not-found)))
    ;; Validate timeout (must be expired)
    (asserts! (>= (- block-height (get created-at payment)) payment-timeout) err-not-expired)
    
    ;; Validate state
    (asserts! (not (get claimed payment)) err-already-claimed)
    (asserts! (not (get refunded payment)) err-already-refunded)
    
    ;; Refund to original sender
    (try! (as-contract (stx-transfer? 
      (get amount payment) 
      tx-sender 
      (get sender payment))))
    
    ;; Mark as refunded
    (map-set payments 
      {payment-id: payment-id} 
      (merge payment {refunded: true}))
    
    ;; Update analytics
    (var-set total-payments-refunded (+ (var-get total-payments-refunded) u1))
    
    ;; Emit event
    (try! (emit-event payment-id "REFUNDED"))
    
    (ok true)
  )
)

;; Read-only: Get payment details
(define-read-only (get-payment (payment-id (buff 32)))
  (map-get? payments {payment-id: payment-id})
)

;; Read-only: Get payment status
(define-read-only (get-payment-status (payment-id (buff 32)))
  (match (map-get? payments {payment-id: payment-id})
    payment (ok {
      exists: true,
      claimed: (get claimed payment),
      refunded: (get refunded payment),
      expired: (>= (- block-height (get created-at payment)) payment-timeout)
    })
    (ok {
      exists: false,
      claimed: false,
      refunded: false,
      expired: false
    })
  )
)

;; Read-only: Get contract statistics
(define-read-only (get-stats)
  {
    total-created: (var-get total-payments-created),
    total-claimed: (var-get total-payments-claimed),
    total-refunded: (var-get total-payments-refunded),
    total-volume: (var-get total-volume),
    success-rate: (if (> (var-get total-payments-created) u0)
                    (/ (* (var-get total-payments-claimed) u100) (var-get total-payments-created))
                    u0)
  }
)

;; Read-only: Check if payment can be refunded
(define-read-only (can-refund (payment-id (buff 32)))
  (match (map-get? payments {payment-id: payment-id})
    payment (ok (and
      (not (get claimed payment))
      (not (get refunded payment))
      (>= (- block-height (get created-at payment)) payment-timeout)
    ))
    (ok false)
  )
)

;; Private: Emit event for indexer
(define-private (emit-event (payment-id (buff 32)) (event-type (string-ascii 20)))
  (let ((event-id (var-get event-counter)))
    (map-set payment-events
      {event-id: event-id}
      {
        payment-id: payment-id,
        event-type: event-type,
        block-height: block-height
      })
    (var-set event-counter (+ event-id u1))
    (ok true)
  )
)
