import React from 'react';
import clsx from 'clsx';
import { connectorStyleDefaults, useConnectorStyles } from './ConnectorStyles';
import { ConnectorStyleProps } from './ConnectorTypes';
import { convertNumericToPixel } from '../../utils';
import StepContext from '../Step/StepContext';
import StepperContext from '../Stepper/StepperContext';

const Connector: React.FC = () => {
  const { connectorStyleConfig } = React.useContext(
    StepperContext
  );
  const { completed, active, stepSize } = React.useContext(StepContext);

  const connectorStyle: ConnectorStyleProps = {
    ...connectorStyleDefaults,
    ...connectorStyleConfig,
    stepSize,
  };

  convertNumericToPixel(connectorStyle, 'stepSize');
  convertNumericToPixel(connectorStyle, 'size');

  const classes = useConnectorStyles(connectorStyle);
  return (
    <div id="RFS-ConnectorContainer" className={classes.ConnectorContainer}>
      <span
        id="RFS-Connector"
        className={clsx(
          classes.Connector,
          { completed: completed },
          { active: active }
        )}
      ></span>
    </div>
  );
};

export default Connector;
