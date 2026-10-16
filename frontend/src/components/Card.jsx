const Card = ({ children, className = "" }) => {
    return (
        <div className={`bg-white dark:bg-[#111827]/90 text-gray-900 dark:text-gray-100 border border-gray-200/90 dark:border-amber-500/15 p-4 rounded-xl shadow-sm transition ${className}`}>
            {children}
        </div>
    );
};

export default Card;