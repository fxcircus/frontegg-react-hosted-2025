import React, { useState, useRef, useEffect } from 'react';
import TooltipPortal from './TooltipPortal';
import './Card.css';

const Card = ({ title, subtitle, children, className = '', tooltipContent, tooltipLink }) => {
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [showTooltip, setShowTooltip] = useState(false);
  const [arrowPosition, setArrowPosition] = useState('left');
  const tooltipIconRef = useRef(null);

  useEffect(() => {
    if (showTooltip && tooltipIconRef.current) {
      const rect = tooltipIconRef.current.getBoundingClientRect();
      const tooltipWidth = 320; // max-width from CSS
      const tooltipHeight = 100; // approximate height
      const margin = 10;
      
      let left = rect.right + margin;
      let top = rect.top;
      let arrow = 'left';
      
      // Check if tooltip would go off right edge
      if (left + tooltipWidth > window.innerWidth - margin) {
        left = rect.left - tooltipWidth - margin;
        arrow = 'right';
      }
      
      // Check if tooltip would go off left edge  
      if (left < margin) {
        left = margin;
      }
      
      // Ensure tooltip doesn't go off top/bottom
      if (top < margin) {
        top = margin;
      } else if (top + tooltipHeight > window.innerHeight - margin) {
        top = window.innerHeight - tooltipHeight - margin;
      }
      
      setTooltipPosition({ top, left });
      setArrowPosition(arrow);
    }
  }, [showTooltip]);

  return (
    <div className={`card ${className}`}>
      {title && (
        <div className="card-header">
          <div className="card-title-wrapper">
            <h3 className="card-title">{title}</h3>
            {tooltipContent && (
              <div 
                className="card-tooltip"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <span className="tooltip-icon" ref={tooltipIconRef}>?</span>
                {showTooltip && (
                  <TooltipPortal>
                    <div 
                      className={`tooltip-portal-content tooltip-arrow-${arrowPosition}`} 
                      style={{ top: tooltipPosition.top, left: tooltipPosition.left }}
                      onMouseEnter={() => setShowTooltip(true)}
                      onMouseLeave={() => setShowTooltip(false)}
                    >
                      <div className="tooltip-portal-arrow"></div>
                      {tooltipContent}
                      {tooltipLink && (
                        <>
                          <br /><br />
                          <a href={tooltipLink} target="_blank" rel="noopener noreferrer">
                            Learn more
                          </a>
                        </>
                      )}
                    </div>
                  </TooltipPortal>
                )}
              </div>
            )}
          </div>
          {subtitle && <p className="card-subtitle">{subtitle}</p>}
        </div>
      )}
      <div className="card-content">
        {children}
      </div>
    </div>
  );
};

export default Card;