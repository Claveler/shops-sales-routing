import { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-regular-svg-icons';
import { faBars, faPlay, faStop, faUserCircle, faTabletScreenButton, faChevronDown, faChevronRight, faMobileRetro, faCashRegister, faCheck, faGear, faLandmarkDome } from '@fortawesome/free-solid-svg-icons';
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

/** Truncate device ID to show prefix and last 4 chars */
function truncateDeviceId(id: string): string {
  if (id.length <= 12) return id;
  const prefix = id.split('-')[0] || id.slice(0, 4);
  const suffix = id.slice(-4);
  return `${prefix}-…${suffix}`;
}

function formatHeaderDate(date: Date): string {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return `${dayNames[date.getDay()]} ${date.getDate()} ${monthNames[date.getMonth()]}, ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
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

  // Combined config dropdown state
  const [isConfigDropdownOpen, setIsConfigDropdownOpen] = useState(false);
  const [expandedVenueId, setExpandedVenueId] = useState<string | null>(null);
  const configDropdownRef = useRef<HTMLDivElement>(null);

  // Start Shift modal state
  const [isStartShiftModalOpen, setIsStartShiftModalOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => setDateStr(formatHeaderDate(new Date()));
    updateTime();
    const timerId = window.setInterval(updateTime, 30_000);
    return () => window.clearInterval(timerId);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isConfigDropdownOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (configDropdownRef.current && !configDropdownRef.current.contains(e.target as Node)) {
        setIsConfigDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isConfigDropdownOpen]);

  // Find the selected setup and its venue for display
  const selectedSetup = venues
    .flatMap((v) => v.setups.map((s) => ({ ...s, venueName: v.name, venueId: v.id })))
    .find((s) => s.id === selectedSetupId);

  // Find the selected device for display
  const selectedDevice = paymentDevices.find((d) => d.id === linkedDeviceId);

  // Auto-expand the venue containing the selected setup when dropdown opens
  useEffect(() => {
    if (isConfigDropdownOpen && selectedSetup && !expandedVenueId) {
      setExpandedVenueId(selectedSetup.venueId);
    }
  }, [isConfigDropdownOpen, selectedSetup, expandedVenueId]);

  const handleToggleVenue = (venueId: string) => {
    setExpandedVenueId((prev) => (prev === venueId ? null : venueId));
  };

  const handleSelectSetup = (setupId: string, venueId: string) => {
    onSelectSetup?.(setupId, venueId);
    // Don't close - let user also select device if needed
  };

  const handleSelectDevice = (deviceId: string) => {
    onSelectDevice?.(deviceId);
    // Don't close - let user also change setup if needed
  };

  // Build compact summary for the button
  const venueSummary = selectedSetup ? selectedSetup.venueName : 'Select venue';
  const setupSummary = selectedSetup ? selectedSetup.name : 'No setup';
  const deviceSummary = selectedDevice ? truncateDeviceId(selectedDevice.id) : 'No device';

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
        {/* Combined POS Configuration dropdown */}
        <div className={styles.configFieldWrap} ref={configDropdownRef}>
          <button
            className={`${styles.configField} ${isConfigDropdownOpen ? styles.configFieldOpen : ''}`}
            type="button"
            onClick={() => setIsConfigDropdownOpen((prev) => !prev)}
            aria-label="POS Configuration"
            aria-expanded={isConfigDropdownOpen}
            aria-haspopup="dialog"
          >
            <FontAwesomeIcon icon={faGear} className={styles.configFieldIcon} />
            <div className={styles.configFieldInner}>
              <span className={styles.configFieldLabel}>
                <FontAwesomeIcon icon={faLandmarkDome} className={styles.configFieldVenueIcon} />
                {venueSummary}
              </span>
              <span className={styles.configFieldValue}>
                <span className={styles.configFieldSetup}>{setupSummary}</span>
                <span className={styles.configFieldSeparator}>•</span>
                <span className={styles.configFieldDevice}>{deviceSummary}</span>
              </span>
            </div>
            <FontAwesomeIcon
              icon={faChevronDown}
              className={`${styles.configFieldChevron} ${isConfigDropdownOpen ? styles.configFieldChevronOpen : ''}`}
            />
          </button>

          {isConfigDropdownOpen && (
            <div className={styles.configDropdown} role="dialog" aria-label="POS Configuration">
              {/* Section 1: Box Office Setup */}
              <div className={styles.configSection}>
                <div className={styles.configSectionHeader}>
                  <FontAwesomeIcon icon={faCashRegister} className={styles.configSectionIcon} />
                  <span className={styles.configSectionTitle}>Box Office Setup</span>
                </div>
                <div className={styles.configSectionContent}>
                  {venues.map((venue) => {
                    const isExpanded = expandedVenueId === venue.id;
                    return (
                      <div key={venue.id} className={styles.setupVenueGroup}>
                        <button
                          type="button"
                          className={styles.setupVenueHeader}
                          onClick={() => handleToggleVenue(venue.id)}
                          aria-expanded={isExpanded}
                        >
                          <FontAwesomeIcon
                            icon={isExpanded ? faChevronDown : faChevronRight}
                            className={styles.setupVenueChevron}
                          />
                          <span className={styles.setupVenueName}>{venue.name}</span>
                        </button>
                        {isExpanded && (
                          <ul className={styles.setupList}>
                            {venue.setups.map((setup) => {
                              const isSelected = setup.id === selectedSetupId;
                              return (
                                <li key={setup.id} role="option" aria-selected={isSelected}>
                                  <button
                                    type="button"
                                    className={`${styles.setupItem} ${isSelected ? styles.setupItemSelected : ''}`}
                                    onClick={() => handleSelectSetup(setup.id, venue.id)}
                                  >
                                    <span className={styles.setupItemName}>{setup.name}</span>
                                    {isSelected && (
                                      <FontAwesomeIcon icon={faCheck} className={styles.setupItemCheck} />
                                    )}
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section 2: Payment Device */}
              <div className={styles.configSection}>
                <div className={styles.configSectionHeader}>
                  <FontAwesomeIcon icon={faMobileRetro} className={styles.configSectionIcon} />
                  <span className={styles.configSectionTitle}>Payment Device</span>
                </div>
                <div className={styles.configSectionContent}>
                  <ul className={styles.deviceList}>
                    {paymentDevices.map((device) => {
                      const isSelected = device.id === linkedDeviceId;
                      return (
                        <li key={device.id} role="option" aria-selected={isSelected}>
                          <button
                            type="button"
                            className={`${styles.deviceItem} ${isSelected ? styles.deviceItemSelected : ''}`}
                            onClick={() => handleSelectDevice(device.id)}
                          >
                            <span className={styles.deviceItemName}>{device.name}</span>
                            {isSelected && (
                              <FontAwesomeIcon icon={faCheck} className={styles.deviceItemCheck} />
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

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
      </div>
    </header>
  );
}
