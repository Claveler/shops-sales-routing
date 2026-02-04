import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faGlobe, faDesktop, faStore, faExternalLinkAlt, faMagicWandSparkles, faCashRegister } from '@fortawesome/free-solid-svg-icons';
import { useDemo } from '../../context/DemoContext';
import { channels, isBoxOfficeChannel } from '../../data/mockData';
import styles from './ChannelSelector.module.css';

// Channel IDs for demo
const BOX_OFFICE_ID = 'box-office';
const MARKETPLACE_ID = 'ch-001'; // Fever Marketplace
const WHITELABEL_ID = 'ch-002';  // Whitelabel

interface ChannelSelectorProps {
  selectedChannelIds: string[];
  onChange: (channelIds: string[]) => void;
}

const channelIcons: Record<string, typeof faGlobe> = {
  onsite: faCashRegister,
  marketplace: faGlobe,
  whitelabel: faDesktop,
  kiosk: faStore,
  ota: faExternalLinkAlt
};

const channelDescriptions: Record<string, string> = {
  onsite: 'Physical POS at event venues',
  marketplace: 'Fever app and website',
  whitelabel: 'Partner branded checkout',
  kiosk: 'Self-service kiosks at venues',
  ota: 'Online Travel Agency partner'
};

export function ChannelSelector({ selectedChannelIds, onChange }: ChannelSelectorProps) {
  const demo = useDemo();
  const existingRoutings = demo.getSalesRoutings();
  const routingCount = existingRoutings.length;

  const handleToggleChannel = (channelId: string) => {
    if (selectedChannelIds.includes(channelId)) {
      onChange(selectedChannelIds.filter(id => id !== channelId));
    } else {
      onChange([...selectedChannelIds, channelId]);
    }
  };

  // Demo flow - simple to complex (matches visual event order):
  // Routing 1 (Taylor Swift): Marketplace only (simplest)
  // Routing 2 (Van Gogh): Marketplace + Whitelabel (medium)
  // Routing 3 (Hans Zimmer): Box Office + Marketplace (complex hybrid)
  const handleSelectSuggested = () => {
    if (routingCount === 0) {
      // First routing: single online channel
      onChange([MARKETPLACE_ID]);
    } else if (routingCount === 1) {
      // Second routing: multiple online channels
      onChange([MARKETPLACE_ID, WHITELABEL_ID]);
    } else {
      // Third routing: hybrid onsite + online
      onChange([BOX_OFFICE_ID, MARKETPLACE_ID]);
    }
  };

  // Separate Box Office from other channels for better organization
  const boxOfficeChannel = channels.find(c => isBoxOfficeChannel(c.id));
  const onlineChannels = channels.filter(c => !isBoxOfficeChannel(c.id));

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h2 className={styles.title}>Select sales channels</h2>
          <p className={styles.subtitle}>
            Choose where products will be available for purchase
          </p>
        </div>
        {demo.isResetMode && (
          <button className={styles.selectSuggestedBtn} onClick={handleSelectSuggested}>
            <FontAwesomeIcon icon={faMagicWandSparkles} />
            Select suggested
          </button>
        )}
      </div>

      {/* Box Office Section */}
      {boxOfficeChannel && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Onsite Sales</h3>
          <div className={styles.channelList}>
            <button
              className={`${styles.channelItem} ${styles.boxOffice} ${selectedChannelIds.includes(boxOfficeChannel.id) ? styles.selected : ''}`}
              onClick={() => handleToggleChannel(boxOfficeChannel.id)}
            >
              <div className={`${styles.checkbox} ${selectedChannelIds.includes(boxOfficeChannel.id) ? styles.checked : ''}`}>
                {selectedChannelIds.includes(boxOfficeChannel.id) && <FontAwesomeIcon icon={faCheck} />}
              </div>
              <div className={`${styles.channelIcon} ${styles.boxOfficeIcon}`}>
                <FontAwesomeIcon icon={channelIcons[boxOfficeChannel.type]} />
              </div>
              <div className={styles.channelInfo}>
                <span className={styles.channelName}>{boxOfficeChannel.name}</span>
                <span className={styles.channelDescription}>
                  {channelDescriptions[boxOfficeChannel.type]}
                </span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Online Channels Section */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Online Channels</h3>
        <div className={styles.channelList}>
          {onlineChannels.map(channel => {
            const isSelected = selectedChannelIds.includes(channel.id);
            
            return (
              <button
                key={channel.id}
                className={`${styles.channelItem} ${isSelected ? styles.selected : ''}`}
                onClick={() => handleToggleChannel(channel.id)}
              >
                <div className={`${styles.checkbox} ${isSelected ? styles.checked : ''}`}>
                  {isSelected && <FontAwesomeIcon icon={faCheck} />}
                </div>
                <div className={styles.channelIcon}>
                  <FontAwesomeIcon icon={channelIcons[channel.type]} />
                </div>
                <div className={styles.channelInfo}>
                  <span className={styles.channelName}>{channel.name}</span>
                  <span className={styles.channelDescription}>
                    {channelDescriptions[channel.type]}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.note}>
        <p>
          <strong>Box Office:</strong> Allows multiple warehouses with a price reference. 
          Individual POS devices can be configured later.
        </p>
        <p>
          <strong>Online channels:</strong> Require a single warehouse for consistent pricing and stock.
        </p>
      </div>
    </div>
  );
}
