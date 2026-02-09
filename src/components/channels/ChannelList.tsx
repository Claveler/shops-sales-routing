import { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEdit, 
  faSearch
} from '@fortawesome/free-solid-svg-icons';
import { useDemo } from '../../context/DemoContext';
import { channels, isBoxOfficeChannel, getChannelTypeCategory, CHANNEL_TYPE_LABELS, type ChannelTypeCategory } from '../../data/mockData';
import styles from './ChannelList.module.css';

interface ChannelListProps {
  selectedChannelId: string | null;
  onSelectChannel: (channelId: string) => void;
  checkedChannelIds: string[];
  onToggleCheck: (channelId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  routingId: string | null;
}

export function ChannelList({
  selectedChannelId,
  onSelectChannel,
  checkedChannelIds,
  onToggleCheck,
  onSelectAll,
  onDeselectAll,
  routingId
}: ChannelListProps) {
  const demo = useDemo();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // Get channels for the selected routing
  const routedChannels = useMemo(() => {
    if (!routingId) return [];
    const routing = demo.getSalesRoutings().find(r => r.id === routingId);
    return routing ? channels.filter(c => routing.channelIds.includes(c.id)) : [];
  }, [routingId, demo]);

  // Filter channels based on search and type category filter
  const filteredChannels = useMemo(() => {
    return routedChannels.filter(channel => {
      const matchesSearch = channel.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || getChannelTypeCategory(channel) === filterType;
      return matchesSearch && matchesType;
    });
  }, [routedChannels, searchQuery, filterType]);

  // Get unique channel type categories for filter dropdown
  const channelTypeCategories = useMemo(() => {
    const cats = new Set<ChannelTypeCategory>(routedChannels.map(c => getChannelTypeCategory(c)));
    return Array.from(cats);
  }, [routedChannels]);

  const allChecked = filteredChannels.length > 0 && 
    filteredChannels.every(c => checkedChannelIds.includes(c.id));

  return (
    <div className={styles.container}>
      <div className={styles.panelHeader}>
        <h3 className={styles.panelTitle}>Channels List</h3>
        <p className={styles.panelSubtitle}>
          Click a channel to check or edit its details, or select multiple to edit in bulk.
        </p>
      </div>

      <div className={styles.filterContainer}>
        <div className={styles.filters}>
          <select 
            className={styles.filterSelect}
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">Filter by channel type</option>
            {channelTypeCategories.map(cat => (
              <option key={cat} value={cat}>
                {CHANNEL_TYPE_LABELS[cat]}
              </option>
            ))}
          </select>

          <div className={styles.searchBox}>
            <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>

        <div className={styles.selectAllRow}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={allChecked}
              onChange={() => allChecked ? onDeselectAll() : onSelectAll()}
              className={styles.checkbox}
            />
            Select all
          </label>
          {checkedChannelIds.length > 1 && (
            <button className={styles.editBulkBtn}>
              Edit in bulk
            </button>
          )}
        </div>
      </div>

      <div className={styles.channelList}>
        {filteredChannels.length === 0 ? (
          <div className={styles.emptyState}>
            {routedChannels.length === 0 ? (
              <p>No channels have sales routing configured yet.</p>
            ) : (
              <p>No channels match your search.</p>
            )}
          </div>
        ) : (
          filteredChannels.map(channel => {
            const isBoxOffice = isBoxOfficeChannel(channel.id);
            const isSelected = selectedChannelId === channel.id;
            const isChecked = checkedChannelIds.includes(channel.id);

            return (
              <div
                key={channel.id}
                className={`${styles.channelItem} ${isSelected ? styles.selected : ''} ${isBoxOffice ? styles.boxOffice : ''}`}
                onClick={() => onSelectChannel(channel.id)}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => {
                    e.stopPropagation();
                    onToggleCheck(channel.id);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className={styles.checkbox}
                />
                <div className={styles.channelInfo}>
                  <span className={styles.channelName}>{channel.name}</span>
                  <span className={`${styles.channelStatus} ${styles.active}`}>Active</span>
                </div>
                <div className={`${styles.channelIcon} ${isBoxOffice ? styles.boxOfficeIcon : ''}`}>
                  <FontAwesomeIcon icon={faEdit} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
