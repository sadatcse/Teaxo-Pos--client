import PropTypes from 'prop-types';

const Mtitle = ({ title, middleContent, rightContent, className }) => {
  return (
    <div
      className={`
        flex flex-col md:flex-row items-center gap-4
        py-4 mb-5 border-b border-slate-200 dark:border-slate-700
        ${className} 
      `}
    >
      {/* Title */}
      <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-50">
        {title}
      </h2>

      {/* Spacer to push content to the right on desktop */}
      <div className="hidden md:block flex-grow">
        {middleContent}
      </div>

      {/* Right Content */}
      {rightContent && (
        <div className="flex items-center gap-2">
          {rightContent}
        </div>
      )}
    </div>
  );
};

// PropTypes provide type checking for components in plain JavaScript
Mtitle.propTypes = {
  /** The main title to be displayed */
  title: PropTypes.string.isRequired,
  
  /** Optional content for the middle section (visible on desktop) */
  middleContent: PropTypes.node,
  
  /** Optional content for the far-right section */
  rightContent: PropTypes.node,
  
  /** Allows for adding custom Tailwind classes */
  className: PropTypes.string,
};

export default Mtitle;