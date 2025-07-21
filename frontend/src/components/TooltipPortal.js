import { createPortal } from 'react-dom';
import './TooltipPortal.css';

const TooltipPortal = ({ children }) => {
  return createPortal(children, document.body);
};

export default TooltipPortal;