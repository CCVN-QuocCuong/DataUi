import { createUseStyles } from 'react-jss';
import { ConnectorStyleProps } from './ConnectorTypes';

export const connectorStyleDefaults: ConnectorStyleProps = {
  disabledColor: '#bdbdbd',
  activeColor: '#BD202D',
  completedColor: '#BD202D',
  size: 2,
  style: 'solid',
};

export const useConnectorStyles = createUseStyles({
  ConnectorContainer: (props: ConnectorStyleProps) => ({
    top: `calc((${props.stepSize} - ${props.size}) / 2)`,
    left: `calc(-50% + ${props.stepSize} - 16px)`,
    right: `calc(50% + ${props.stepSize} - 16px)`,
    position: 'absolute',
  }),
  Connector: (props: ConnectorStyleProps) => ({
    borderTopStyle: props.style,
    borderTopWidth: props.size,
    borderColor: props.disabledColor,
    display: 'block',
    '&.completed': {
      borderColor: props.completedColor,
    },
    '&.active': {
      borderColor: props.activeColor,
    },
  }),
});
