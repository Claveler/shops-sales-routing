import { useState, useCallback, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAddressCard, faXmark, faCrosshairs, faMagicWandSparkles, faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { AlphanumericKeyboard } from './AlphanumericKeyboard';
import styles from './MemberIdentifyModal.module.css';

/** Extended member info shown in the confirmation step. */
export interface MemberInfo {
  id: string;
  name: string;
  avatarUrl?: string;
  household?: string;
  householdVerified?: boolean;
  membershipTier?: 'Gold' | 'Silver' | 'Basic';
  membershipRole?: 'primary' | 'beneficiary';
  membershipRoleLabel?: string;
  memberSince?: string;
}

interface MemberIdentifyModalProps {
  isOpen: boolean;
  onIdentify: (member: MemberInfo) => void;
  onClose: () => void;
  /** When true, shows on-screen keyboard instead of native input */
  isDevicePreview?: boolean;
}

/** Hardcoded demo member for mockup purposes. */
const DEMO_MEMBER: MemberInfo = {
  id: '7261322',
  name: 'Anderson Collingwood',
  avatarUrl: undefined, // will use initials fallback
  household: 'Collingwood Family',
  householdVerified: true,
  membershipTier: 'Gold',
  membershipRole: 'primary',
  membershipRoleLabel: 'Primary Member',
  memberSince: '11/04/2022',
};

type ModalStep = 'search' | 'confirm';

export function MemberIdentifyModal({ isOpen, onIdentify, onClose, isDevicePreview }: MemberIdentifyModalProps) {
  const [inputValue, setInputValue] = useState('');
  const [step, setStep] = useState<ModalStep>('search');
  const [pendingMember, setPendingMember] = useState<MemberInfo | null>(null);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset state when the modal opens
  useEffect(() => {
    if (isOpen) {
      setInputValue('');
      setStep('search');
      setPendingMember(null);
      setIsKeyboardOpen(false);
      // Only auto-focus if not in device preview mode
      if (!isDevicePreview) {
        const t = setTimeout(() => inputRef.current?.focus(), 100);
        return () => clearTimeout(t);
      }
    }
  }, [isOpen, isDevicePreview]);

  /** Move to the confirmation step with the looked-up member. */
  const showConfirmation = useCallback((member: MemberInfo) => {
    setPendingMember(member);
    setStep('confirm');
  }, []);

  const handleSubmit = useCallback(() => {
    if (!inputValue.trim()) return;
    // In a real implementation this would call an API; for now use the demo member
    showConfirmation(DEMO_MEMBER);
  }, [inputValue, showConfirmation]);

  const handleFillDemoMember = useCallback(() => {
    showConfirmation(DEMO_MEMBER);
  }, [showConfirmation]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleSubmit();
    },
    [handleSubmit],
  );

  // Handlers for on-screen keyboard
  const handleInputClick = useCallback(() => {
    if (isDevicePreview) {
      setIsKeyboardOpen(true);
    }
  }, [isDevicePreview]);

  const handleKeyboardChange = useCallback((value: string) => {
    setInputValue(value);
  }, []);

  const handleKeyboardConfirm = useCallback(() => {
    setIsKeyboardOpen(false);
    if (inputValue.trim()) {
      handleSubmit();
    }
  }, [inputValue, handleSubmit]);

  const handleKeyboardCancel = useCallback(() => {
    setIsKeyboardOpen(false);
  }, []);

  /** User confirmed — apply membership. */
  const handleApply = useCallback(() => {
    if (pendingMember) onIdentify(pendingMember);
  }, [pendingMember, onIdentify]);

  /** User cancelled the confirmation — go back to search. */
  const handleBackToSearch = useCallback(() => {
    setStep('search');
    setPendingMember(null);
    // Re-focus input after returning
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  if (!isOpen) return null;

  /** Helper: get initials from a full name. */
  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  const overlayClasses = [
    styles.overlay,
    isKeyboardOpen ? styles.overlayKeyboardOpen : '',
  ].filter(Boolean).join(' ');

  const modalClasses = [
    styles.modal,
    isKeyboardOpen ? styles.modalKeyboardOpen : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={overlayClasses} role="presentation" onClick={isKeyboardOpen ? undefined : onClose}>
      <div
        className={modalClasses}
        role="dialog"
        aria-modal="true"
        aria-label="Identify member"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Identify member</h2>
          <button
            type="button"
            className={styles.closeButton}
            aria-label="Close"
            onClick={onClose}
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <div className={styles.divider} />

        {/* ---- STEP 1: Search ---- */}
        {step === 'search' && (
          <div className={styles.content}>
            <div className={styles.block}>
              {/* Instruction */}
              <div className={styles.instruction}>
                <FontAwesomeIcon icon={faAddressCard} className={styles.instructionIcon} />
                <p className={styles.instructionText}>
                  Scan the QR code or enter the ID manually
                </p>
              </div>

              {/* Input field */}
              <div className={styles.fieldWrapper}>
                <input
                  ref={inputRef}
                  type="text"
                  className={styles.field}
                  placeholder="Member ID"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onClick={handleInputClick}
                  readOnly={isDevicePreview}
                />
                <span className={styles.fieldLabel}>Member ID</span>
                <span className={styles.fieldIcon}>
                  <FontAwesomeIcon icon={faCrosshairs} />
                </span>
              </div>

              {/* Demo prefill */}
              <button
                type="button"
                className={styles.fillDemoBtn}
                onClick={handleFillDemoMember}
              >
                <FontAwesomeIcon icon={faMagicWandSparkles} />
                Enter demo member
              </button>
            </div>
          </div>
        )}

        {/* ---- STEP 2: Confirm ---- */}
        {step === 'confirm' && pendingMember && (
          <>
            <div className={styles.content}>
              <div className={styles.memberCard}>
                {/* Member info row */}
                <div className={styles.memberRow}>
                  {/* Avatar */}
                  <div className={styles.memberAvatar}>
                    {pendingMember.avatarUrl ? (
                      <img
                        src={pendingMember.avatarUrl}
                        alt={pendingMember.name}
                        className={styles.memberAvatarImg}
                      />
                    ) : (
                      <span className={styles.memberAvatarInitials}>
                        {getInitials(pendingMember.name)}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className={styles.memberInfo}>
                    <p className={styles.memberName}>{pendingMember.name}</p>

                    {pendingMember.household && (
                      <div className={styles.memberHousehold}>
                        <span className={styles.memberHouseholdLink}>
                          {pendingMember.household}
                        </span>
                        {pendingMember.householdVerified && (
                          <FontAwesomeIcon
                            icon={faCircleCheck}
                            className={styles.memberVerifiedIcon}
                          />
                        )}
                      </div>
                    )}

                    <div className={styles.memberTags}>
                      {pendingMember.membershipTier && (
                        <span className={styles.memberTag}>
                          {pendingMember.membershipTier}
                        </span>
                      )}
                      {pendingMember.membershipRoleLabel && (
                        <span className={styles.memberSince}>
                          {pendingMember.membershipRoleLabel}
                        </span>
                      )}
                      {pendingMember.memberSince && (
                        <span className={styles.memberSince}>
                          since {pendingMember.memberSince}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div className={styles.confirmFooter}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={handleBackToSearch}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.applyBtn}
                onClick={handleApply}
              >
                Apply membership
              </button>
            </div>
          </>
        )}
      </div>

      {/* On-screen keyboard for device preview mode */}
      {isKeyboardOpen && isDevicePreview && (
        <AlphanumericKeyboard
          value={inputValue}
          onChange={handleKeyboardChange}
          onConfirm={handleKeyboardConfirm}
          onCancel={handleKeyboardCancel}
        />
      )}
    </div>
  );
}
