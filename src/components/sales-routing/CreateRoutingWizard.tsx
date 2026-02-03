import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, faCheck } from '@fortawesome/free-solid-svg-icons';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Breadcrumb } from '../common/Breadcrumb';
import { TypeSelector } from './TypeSelector';
import { EventSelector } from './EventSelector';
import { WarehouseSelector } from './WarehouseSelector';
import { ChannelProductMapping } from './ChannelProductMapping';
import { ReviewStep } from './ReviewStep';
import type { RoutingType, RoutingStatus } from '../../data/mockData';
import styles from './CreateRoutingWizard.module.css';

interface WizardStep {
  id: string;
  title: string;
  isOptional?: boolean;
}

const baseSteps: WizardStep[] = [
  { id: 'type', title: 'Type' },
  { id: 'event', title: 'Event' },
  { id: 'warehouse', title: 'Warehouse' },
  { id: 'review', title: 'Review' },
];

const onlineSteps: WizardStep[] = [
  { id: 'type', title: 'Type' },
  { id: 'event', title: 'Event' },
  { id: 'warehouse', title: 'Warehouse' },
  { id: 'channels', title: 'Channels' },
  { id: 'review', title: 'Review' },
];

export function CreateRoutingWizard() {
  const navigate = useNavigate();
  
  // Form state
  const [routingType, setRoutingType] = useState<RoutingType | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedWarehouseIds, setSelectedWarehouseIds] = useState<string[]>([]);
  const [channelMapping, setChannelMapping] = useState<Record<string, string[]>>({});
  const [status, setStatus] = useState<RoutingStatus>('draft');
  
  // Wizard state
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  
  const steps = routingType === 'online' ? onlineSteps : baseSteps;
  const currentStep = steps[currentStepIndex];
  
  const canProceed = () => {
    switch (currentStep.id) {
      case 'type':
        return routingType !== null;
      case 'event':
        return selectedEventId !== null;
      case 'warehouse':
        return selectedWarehouseIds.length > 0;
      case 'channels':
        return true; // Optional, can proceed without configuring all
      case 'review':
        return true;
      default:
        return false;
    }
  };
  
  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };
  
  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };
  
  const handleCreate = () => {
    // In a real app, this would make an API call
    console.log('Creating routing:', {
      type: routingType,
      eventId: selectedEventId,
      warehouseIds: selectedWarehouseIds,
      channelMapping: routingType === 'online' ? channelMapping : undefined,
      status
    });
    
    // Navigate back to list
    navigate('/products/sales-routing');
  };
  
  const handleCancel = () => {
    navigate('/products/sales-routing');
  };
  
  const renderStep = () => {
    switch (currentStep.id) {
      case 'type':
        return (
          <TypeSelector 
            value={routingType} 
            onChange={(type) => {
              setRoutingType(type);
              // Reset channel mapping if switching from online to onsite
              if (type === 'onsite') {
                setChannelMapping({});
              }
            }} 
          />
        );
      case 'event':
        return (
          <EventSelector 
            value={selectedEventId} 
            onChange={setSelectedEventId} 
          />
        );
      case 'warehouse':
        return (
          <WarehouseSelector 
            value={selectedWarehouseIds} 
            onChange={setSelectedWarehouseIds} 
          />
        );
      case 'channels':
        return (
          <ChannelProductMapping 
            warehouseIds={selectedWarehouseIds}
            value={channelMapping}
            onChange={setChannelMapping}
          />
        );
      case 'review':
        return (
          <ReviewStep 
            type={routingType!}
            eventId={selectedEventId!}
            warehouseIds={selectedWarehouseIds}
            channelMapping={channelMapping}
            status={status}
            onStatusChange={setStatus}
          />
        );
      default:
        return null;
    }
  };
  
  const isLastStep = currentStepIndex === steps.length - 1;
  
  return (
    <div className={styles.container}>
      <Breadcrumb 
        items={[
          { label: 'Products', path: '/products' },
          { label: 'Sales routing', path: '/products/sales-routing' },
          { label: 'Create new' }
        ]} 
      />
      
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Create sales routing</h1>
      </div>

      <Card padding="none">
        <div className={styles.cardInner}>
          {/* Progress Steps */}
          <div className={styles.progressBar}>
            {steps.map((step, index) => (
              <div 
                key={step.id}
                className={`${styles.progressStep} ${index <= currentStepIndex ? styles.active : ''} ${index < currentStepIndex ? styles.completed : ''}`}
              >
                <div className={styles.stepIndicator}>
                  {index < currentStepIndex ? (
                    <FontAwesomeIcon icon={faCheck} />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className={styles.stepLabel}>{step.title}</span>
                {index < steps.length - 1 && <div className={styles.stepConnector} />}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className={styles.stepContent}>
            {renderStep()}
          </div>

          {/* Navigation */}
          <div className={styles.navigation}>
            <div className={styles.navLeft}>
              <Button variant="ghost" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
            <div className={styles.navRight}>
              {currentStepIndex > 0 && (
                <Button 
                  variant="outline" 
                  icon={faArrowLeft}
                  onClick={handleBack}
                >
                  Back
                </Button>
              )}
              {isLastStep ? (
                <Button 
                  variant="primary"
                  icon={faCheck}
                  onClick={handleCreate}
                  disabled={!canProceed()}
                >
                  Create routing
                </Button>
              ) : (
                <Button 
                  variant="primary"
                  icon={faArrowRight}
                  iconPosition="right"
                  onClick={handleNext}
                  disabled={!canProceed()}
                >
                  Next
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
