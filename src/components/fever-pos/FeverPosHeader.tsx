import { useEffect, useState, useRef, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-regular-svg-icons';
import { faBars, faPlay, faStop, faUserCircle, faTabletScreenButton, faChevronDown, faGear, faXmark, faMagnifyingGlass, faMobileScreenButton, faShareNodes, faArrowRightFromBracket, faBuildingColumns, faCashRegister } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import styles from './FeverPosHeader.module.css';
import feverLogo from '../../assets/fever-logo.svg';

export interface PaymentDevice {
  id: string;
  name: string;
}

export interface PosSetup {
  id: string;
  name: string;
  linkedDeviceIds?: string[]; // Payment devices physically located at this setup
}

export interface Venue {
  id: string;
  name: string;
  setups: PosSetup[];
}

export interface ShiftInfo {
  id: string;
  startTime: Date;
  cashRegisterId: string;
  cashRegisterName: string;
  openingCash: number;
}

export interface CashRegister {
  id: string;
  name: string;
}

interface FeverPosHeaderProps {
  isDevicePreview?: boolean;
  onToggleDevicePreview?: () => void;
  linkedDeviceId?: string | null;
  paymentDevices?: PaymentDevice[];
  onSelectDevice?: (deviceId: string) => void;
  venues?: Venue[];
  selectedSetupId?: string | null;
  onSelectSetup?: (setupId: string, venueId: string) => void;
  // Shift-related props
  activeShift?: ShiftInfo | null;
  cashRegisters?: CashRegister[];
  onStartShift?: (cashRegisterId: string, openingCash: number) => void;
  onEndShift?: () => void;
}

function formatHeaderDate(date: Date): string {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  let hour = date.getHours();
  const suffix = hour >= 12 ? 'PM' : 'AM';
  if (hour > 12) hour -= 12;
  if (hour === 0) hour = 12;
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${dayNames[date.getDay()]}, ${monthNames[date.getMonth()]} ${date.getDate()}, ${hour}:${minutes} ${suffix}`;
}

interface StartShiftModalProps {
  cashRegisters: CashRegister[];
  onStartShift: (cashRegisterId: string, openingCash: number) => void;
  onClose: () => void;
}

function StartShiftModal({ cashRegisters, onStartShift, onClose }: StartShiftModalProps) {
  const [selectedCashRegisterId, setSelectedCashRegisterId] = useState('');
  const [cashAmountDisplay, setCashAmountDisplay] = useState('');
  const [isCashRegisterDropdownOpen, setIsCashRegisterDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isCashRegisterDropdownOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsCashRegisterDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isCashRegisterDropdownOpen]);

  // Close modal when clicking backdrop
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  // Auto-format cash amount with currency symbol
  const handleCashAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9.]/g, '');
    
    // Handle empty input
    if (!rawValue) {
      setCashAmountDisplay('');
      return;
    }

    // Parse and format with currency
    const numericValue = parseFloat(rawValue);
    if (!isNaN(numericValue)) {
      setCashAmountDisplay(`€${rawValue}`);
    }
  };

  const handleSubmit = () => {
    const numericValue = parseFloat(cashAmountDisplay.replace(/[^0-9.]/g, '')) || 0;
    onStartShift(selectedCashRegisterId, numericValue);
  };

  const selectedCashRegister = cashRegisters.find((cr) => cr.id === selectedCashRegisterId);

  return (
    <div className={styles.modalBackdrop} onClick={handleBackdropClick}>
      <div className={styles.startShiftModal} ref={modalRef} role="dialog" aria-labelledby="start-shift-title">
        <h2 id="start-shift-title" className={styles.startShiftModalTitle}>Do you want to start your shift?</h2>

        {/* Divider line after title */}
        <div className={styles.startShiftDivider} />

        {/* Cash Register Section */}
        <div className={styles.startShiftSection}>
          <p className={styles.startShiftSectionHeading}>Select the cash register you're working at:</p>
          <label className={styles.startShiftLabel}>
            Cash register <span className={styles.startShiftRequired}>*</span>
          </label>
          <div className={styles.cashRegisterDropdownWrap} ref={dropdownRef}>
            <button
              type="button"
              className={`${styles.cashRegisterDropdownTrigger} ${isCashRegisterDropdownOpen ? styles.cashRegisterDropdownTriggerOpen : ''}`}
              onClick={() => setIsCashRegisterDropdownOpen((prev) => !prev)}
              aria-expanded={isCashRegisterDropdownOpen}
              aria-haspopup="listbox"
            >
              <span className={`${styles.cashRegisterDropdownValue} ${!selectedCashRegister ? styles.cashRegisterDropdownPlaceholder : ''}`}>
                {selectedCashRegister?.name || 'Select an option'}
              </span>
              <FontAwesomeIcon
                icon={faChevronDown}
                className={`${styles.cashRegisterDropdownChevron} ${isCashRegisterDropdownOpen ? styles.cashRegisterDropdownChevronOpen : ''}`}
              />
            </button>
            {isCashRegisterDropdownOpen && (
              <ul className={styles.cashRegisterDropdownList} role="listbox">
                {cashRegisters.map((cr) => (
                  <li key={cr.id} role="option" aria-selected={cr.id === selectedCashRegisterId}>
                    <button
                      type="button"
                      className={`${styles.cashRegisterDropdownItem} ${cr.id === selectedCashRegisterId ? styles.cashRegisterDropdownItemSelected : ''}`}
                      onClick={() => {
                        setSelectedCashRegisterId(cr.id);
                        setIsCashRegisterDropdownOpen(false);
                      }}
                    >
                      {cr.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Cash Amount Section */}
        <div className={styles.startShiftSection}>
          <p className={styles.startShiftSectionHeading}>If there is any cash, please add the exact amount:</p>
          <input
            id="cash-amount-input"
            type="text"
            inputMode="numeric"
            className={styles.cashAmountInput}
            value={cashAmountDisplay}
            onChange={handleCashAmountChange}
            placeholder="Cash amount"
          />
        </div>

        {/* Actions */}
        <div className={styles.startShiftActions}>
          <button type="button" className={styles.startShiftCancelBtn} onClick={onClose}>
            CANCEL
          </button>
          <button
            type="button"
            className={styles.startShiftSubmitBtn}
            onClick={handleSubmit}
            disabled={!selectedCashRegisterId}
          >
            START SHIFT
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---- Setup Wizard Modal ---- */

interface SetupWizardModalProps {
  venues: Venue[];
  selectedSetupId?: string | null;
  onSelectSetup: (setupId: string, venueId: string) => void;
  onClose: () => void;
}

function SetupWizardModal({ venues, selectedSetupId, onSelectSetup, onClose }: SetupWizardModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [pickedVenueId, setPickedVenueId] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Pre-select the venue containing the current setup
  useEffect(() => {
    if (selectedSetupId) {
      const venueWithSetup = venues.find((v) =>
        v.setups.some((s) => s.id === selectedSetupId),
      );
      if (venueWithSetup) setPickedVenueId(venueWithSetup.id);
    }
  }, [selectedSetupId, venues]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const filteredVenues = useMemo(() => {
    if (!searchQuery.trim()) return venues;
    const q = searchQuery.toLowerCase();
    return venues.filter((v) => v.name.toLowerCase().includes(q));
  }, [venues, searchQuery]);

  const pickedVenue = venues.find((v) => v.id === pickedVenueId);
  const currentSetupName = venues
    .flatMap((v) => v.setups)
    .find((s) => s.id === selectedSetupId)?.name ?? 'Default';

  return (
    <div className={styles.modalBackdrop} onClick={handleBackdropClick}>
      <div className={styles.setupWizardModal} ref={modalRef} role="dialog" aria-labelledby="setup-wizard-title">
        <div className={styles.setupWizardHeader}>
          <h2 id="setup-wizard-title" className={styles.setupWizardTitle}>
            Select Your Setup - {currentSetupName}
          </h2>
          <button type="button" className={styles.setupWizardClose} onClick={onClose} aria-label="Close">
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <div className={styles.setupWizardGreeting}>
          <span>👋</span> Hello Andres Clavel,
        </div>
        <p className={styles.setupWizardSubtitle}>Please select where you're working from today.</p>

        <div className={styles.setupWizardBody}>
          <p className={styles.setupWizardStepLabel}>First, let's select the venue</p>

          <div className={styles.setupWizardSearchWrap}>
            <FontAwesomeIcon icon={faMagnifyingGlass} className={styles.setupWizardSearchIcon} />
            <input
              type="text"
              className={styles.setupWizardSearchInput}
              placeholder="Write the venue name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className={styles.setupWizardSearchLabel}>Search venues</span>
          </div>

          <div className={styles.setupWizardGrid}>
            {filteredVenues.map((venue) => (
              <button
                key={venue.id}
                type="button"
                className={`${styles.setupWizardCard} ${venue.id === pickedVenueId ? styles.setupWizardCardSelected : ''}`}
                onClick={() => setPickedVenueId(venue.id)}
              >
                {venue.name}
              </button>
            ))}
          </div>

          {pickedVenue && (
            <>
              <p className={styles.setupWizardStepLabel}>And now, select your setup</p>
              <div className={styles.setupWizardGrid}>
                {pickedVenue.setups.map((setup) => (
                  <button
                    key={setup.id}
                    type="button"
                    className={`${styles.setupWizardCard} ${setup.id === selectedSetupId ? styles.setupWizardCardSelected : ''}`}
                    onClick={() => onSelectSetup(setup.id, pickedVenue.id)}
                  >
                    {setup.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---- Link Device Modal ---- */

interface LinkDeviceModalProps {
  paymentDevices: PaymentDevice[];
  linkedDeviceId?: string | null;
  linkedDeviceIds?: string[];
  setupName: string;
  onSelectDevice: (deviceId: string) => void;
  onClose: () => void;
}

function LinkDeviceModal({
  paymentDevices,
  linkedDeviceId,
  linkedDeviceIds,
  setupName,
  onSelectDevice,
  onClose,
}: LinkDeviceModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  const availableDevices = linkedDeviceIds !== undefined
    ? paymentDevices.filter((d) => linkedDeviceIds.includes(d.id))
    : paymentDevices;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  return (
    <div className={styles.modalBackdrop} onClick={handleBackdropClick}>
      <div className={styles.linkDeviceModal} ref={modalRef} role="dialog" aria-labelledby="link-device-title">
        <div className={styles.setupWizardHeader}>
          <h2 id="link-device-title" className={styles.setupWizardTitle}>
            Link Payment Device
          </h2>
          <button type="button" className={styles.setupWizardClose} onClick={onClose} aria-label="Close">
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <p className={styles.linkDeviceSubtitle}>
          Select the Adyen terminal linked to <strong>{setupName}</strong>.
        </p>

        <div className={styles.linkDeviceBody}>
          {availableDevices.length === 0 ? (
            <div className={styles.linkDeviceEmpty}>
              <FontAwesomeIcon icon={faMobileScreenButton} className={styles.linkDeviceEmptyIcon} />
              <p className={styles.linkDeviceEmptyText}>No payment devices are linked to this setup.</p>
              <p className={styles.linkDeviceEmptyHint}>Contact your administrator to configure devices.</p>
            </div>
          ) : (
            <div className={styles.linkDeviceList}>
              {availableDevices.map((device) => {
                const isSelected = device.id === linkedDeviceId;
                return (
                  <button
                    key={device.id}
                    type="button"
                    className={`${styles.linkDeviceCard} ${isSelected ? styles.linkDeviceCardSelected : ''}`}
                    onClick={() => onSelectDevice(device.id)}
                  >
                    <FontAwesomeIcon
                      icon={faMobileScreenButton}
                      className={`${styles.linkDeviceCardIcon} ${isSelected ? styles.linkDeviceCardIconSelected : ''}`}
                    />
                    <div className={styles.linkDeviceCardInfo}>
                      <span className={styles.linkDeviceCardId}>{device.id}</span>
                      <span className={styles.linkDeviceCardName}>{device.name}</span>
                    </div>
                    {isSelected && (
                      <span className={styles.linkDeviceCardBadge}>Connected</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function FeverPosHeader({
  isDevicePreview = false,
  onToggleDevicePreview,
  linkedDeviceId,
  paymentDevices = [],
  onSelectDevice,
  venues = [],
  selectedSetupId,
  onSelectSetup,
  activeShift,
  cashRegisters = [],
  onStartShift,
  onEndShift,
}: FeverPosHeaderProps) {
  const navigate = useNavigate();
  const [dateStr, setDateStr] = useState(() => formatHeaderDate(new Date()));

  // Hamburger popover state
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const hamburgerRef = useRef<HTMLDivElement>(null);

  // Setup wizard modal state
  const [isSetupWizardOpen, setIsSetupWizardOpen] = useState(false);

  // Link device modal state
  const [isLinkDeviceOpen, setIsLinkDeviceOpen] = useState(false);

  // Start Shift modal state
  const [isStartShiftModalOpen, setIsStartShiftModalOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => setDateStr(formatHeaderDate(new Date()));
    updateTime();
    const timerId = window.setInterval(updateTime, 30_000);
    return () => window.clearInterval(timerId);
  }, []);

  // Close hamburger popover on outside click
  useEffect(() => {
    if (!isHamburgerOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (hamburgerRef.current && !hamburgerRef.current.contains(e.target as Node)) {
        setIsHamburgerOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isHamburgerOpen]);

  // Find the selected setup and its venue for display
  const selectedSetup = venues
    .flatMap((v) => v.setups.map((s) => ({ ...s, venueName: v.name, venueId: v.id })))
    .find((s) => s.id === selectedSetupId);

  const selectedDevice = paymentDevices.find((d) => d.id === linkedDeviceId);

  return (
    <header className={styles.header}>
      <div className={styles.leadSide}>
        <button
          className={styles.menuButton}
          onClick={() => navigate('/products/catalog-integration')}
          aria-label="Back to main menu"
          type="button"
        >
          <FontAwesomeIcon icon={faBars} />
        </button>

        <a href="/" className={styles.logo}>
          <img src={feverLogo} alt="Fever Zone" />
        </a>

        {onToggleDevicePreview && (
          <div className={styles.devicePreviewWrap}>
            <button
              className={`${styles.devicePreviewBtn} ${isDevicePreview ? styles.devicePreviewBtnActive : ''}`}
              onClick={onToggleDevicePreview}
              type="button"
              aria-label="Toggle iMin device preview"
              aria-pressed={isDevicePreview}
            >
              <FontAwesomeIcon icon={faTabletScreenButton} />
              <span className={styles.devicePreviewBtnText}>
                <span>Simulate</span>
                <span>iMin Swan 1 Pro</span>
              </span>
            </button>
            <span className={styles.devicePreviewTooltip}>
              Simulate the iMin Swan 1 Pro display (1397&times;786 dp)
            </span>
          </div>
        )}
      </div>

      <div className={styles.trailSide}>
        <div className={styles.shiftWidget}>
          <div className={styles.dateTime}>
            <FontAwesomeIcon icon={faClock} className={styles.clockIcon} />
            <span>{dateStr}</span>
          </div>
          {activeShift ? (
            <div className={styles.shiftActions}>
              <a href="#" className={styles.shiftDetailsLink}>
                See shift details
              </a>
              <button
                className={styles.endShift}
                type="button"
                onClick={onEndShift}
              >
                <FontAwesomeIcon icon={faStop} className={styles.stopIcon} />
                <span>End shift</span>
              </button>
            </div>
          ) : (
            <button
              className={styles.startShift}
              type="button"
              onClick={() => setIsStartShiftModalOpen(true)}
            >
              <FontAwesomeIcon icon={faPlay} className={styles.playIcon} />
              <span>Start shift</span>
            </button>
          )}
        </div>

        {/* Start Shift Modal */}
        {isStartShiftModalOpen && (
          <StartShiftModal
            cashRegisters={cashRegisters}
            onStartShift={(cashRegisterId, openingCash) => {
              onStartShift?.(cashRegisterId, openingCash);
              setIsStartShiftModalOpen(false);
            }}
            onClose={() => setIsStartShiftModalOpen(false)}
          />
        )}

        <div className={styles.userMenu}>
          <button className={styles.userButton} aria-label="User menu" type="button">
            <span className={styles.userInfo}>
              <span className={styles.userName}>Andres Clavel</span>
              <span className={styles.userOrg}>Fonck Museum</span>
            </span>
            <FontAwesomeIcon icon={faUserCircle} className={styles.userIcon} />
          </button>
        </div>

        {/* Hamburger menu */}
        <div className={styles.hamburgerWrap} ref={hamburgerRef}>
          <button
            className={styles.hamburgerButton}
            type="button"
            onClick={() => setIsHamburgerOpen((prev) => !prev)}
            aria-label="Menu"
            aria-expanded={isHamburgerOpen}
            aria-haspopup="menu"
          >
            <FontAwesomeIcon icon={faBars} />
          </button>

          {isHamburgerOpen && (
            <div className={styles.hamburgerPopover} role="menu">
              <button
                type="button"
                className={styles.popoverItem}
                role="menuitem"
                onClick={() => {
                  setIsHamburgerOpen(false);
                  setIsSetupWizardOpen(true);
                }}
              >
                <FontAwesomeIcon icon={faGear} className={styles.popoverItemIcon} />
                <span className={styles.popoverItemLabel}>Change setup</span>
              </button>

              <div className={styles.popoverInfoBox}>
                <div className={styles.popoverInfoRow}>
                  <FontAwesomeIcon icon={faBuildingColumns} className={styles.popoverInfoIcon} />
                  <span className={styles.popoverInfoText}>
                    {selectedSetup?.venueName ?? 'No venue'}
                  </span>
                </div>
                <div className={styles.popoverInfoRow}>
                  <FontAwesomeIcon icon={faCashRegister} className={styles.popoverInfoIcon} />
                  <span className={styles.popoverInfoText}>
                    {selectedSetup?.name ?? 'No setup selected'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className={styles.popoverItem}
                role="menuitem"
                onClick={() => {
                  setIsHamburgerOpen(false);
                  setIsLinkDeviceOpen(true);
                }}
              >
                <FontAwesomeIcon icon={faMobileScreenButton} className={styles.popoverItemIcon} />
                <div className={styles.popoverItemContent}>
                  <span className={styles.popoverItemLabel}>Link device</span>
                  {selectedDevice && (
                    <span className={styles.popoverItemSub}>{selectedDevice.id}</span>
                  )}
                </div>
              </button>

              <div className={styles.popoverDivider} />

              <button type="button" className={styles.popoverItem} role="menuitem">
                <FontAwesomeIcon icon={faShareNodes} className={styles.popoverItemIcon} />
                <span className={styles.popoverItemLabel}>Get universal share link</span>
              </button>

              <button type="button" className={styles.popoverItem} role="menuitem">
                <FontAwesomeIcon icon={faArrowRightFromBracket} className={styles.popoverItemIcon} />
                <span className={styles.popoverItemLabel}>Log out</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Setup Wizard Modal */}
      {isSetupWizardOpen && (
        <SetupWizardModal
          venues={venues}
          selectedSetupId={selectedSetupId}
          onSelectSetup={(setupId, venueId) => {
            onSelectSetup?.(setupId, venueId);
            setIsSetupWizardOpen(false);
          }}
          onClose={() => setIsSetupWizardOpen(false)}
        />
      )}

      {/* Link Device Modal */}
      {isLinkDeviceOpen && (
        <LinkDeviceModal
          paymentDevices={paymentDevices}
          linkedDeviceId={linkedDeviceId}
          linkedDeviceIds={selectedSetup?.linkedDeviceIds}
          setupName={selectedSetup?.name ?? 'No setup'}
          onSelectDevice={(deviceId) => {
            onSelectDevice?.(deviceId);
            setIsLinkDeviceOpen(false);
          }}
          onClose={() => setIsLinkDeviceOpen(false)}
        />
      )}
    </header>
  );
}
