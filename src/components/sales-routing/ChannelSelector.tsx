import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faGlobe, faDesktop, faStore, faExternalLinkAlt, faMagicWandSparkles } from '@fortawesome/free-solid-svg-icons';
import { useDemo } from '../../context/DemoContext';
import { channels } from '../../data/mockData';
import styles from './ChannelSelector.module.css';

// Suggested channels for demo: Fever Marketplace and Whitelabel
const SUGGESTED_CHANNEL_IDS = ['ch-001', 'ch-002'];

interface ChannelSelectorProps {
  selectedChannelIds: string[];
  onChange: (channelIds: string[]) => void;
  productCount: number;
}

const channelIcons: Record<string, typeof faGlobe> = {
  marketplace: faGlobe,
  whitelabel: faDesktop,
  kiosk: faStore,
  ota: faExternalLinkAlt
};

const channelDescriptions: Record<string, string> = {
  marketplace: 'Fever app and website',
  whitelabel: 'Partner branded checkout',
  kiosk: 'Self-service kiosks at venues',
  ota: 'Online Travel Agency partner'
};

export function ChannelSelector({ selectedChannelIds, onChange, productCount }: ChannelSelectorProps) {
  const demo = useDemo();

  const handleToggleChannel = (channelId: string) => {
    if (selectedChannelIds.includes(channelId)) {
      onChange(selectedChannelIds.filter(id => id !== channelId));
    } else {
      onChange([...selectedChannelIds, channelId]);
    }
  };

  const handleSelectSuggested = () => {
    onChange(SUGGESTED_CHANNEL_IDS);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h2 className={styles.title}>Select channels</h2>
          <p className={styles.subtitle}>
            Where should {productCount === 1 ? 'this product' : `these ${productCount} products`} be available for purchase?
          </p>
        </div>
        {demo.isResetMode && (
          <button className={styles.selectSuggestedBtn} onClick={handleSelectSuggested}>
            <FontAwesomeIcon icon={faMagicWandSparkles} />
            Select suggested
          </button>
        )}
      </div>

      <div className={styles.channelList}>
        {channels.map(channel => {
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

      <div className={styles.note}>
        <p>All selected products will be published to these channels.</p>
      </div>
    </div>
  );
}
