export default function BouncingDots() {
    return (
      <div className="flex items-center space-x-1 h-8">
        <span className="dot bg-neutral-400 dark:bg-neutral-600 rounded-full w-2 h-2 animate-bounce" style={{ animationDelay: '0s' }}></span>
        <span className="dot bg-neutral-400 dark:bg-neutral-600 rounded-full w-2 h-2 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
        <span className="dot bg-neutral-400 dark:bg-neutral-600 rounded-full w-2 h-2 animate-bounce" style={{ animationDelay: '0.4s' }}></span>
        <style jsx>{`
          .animate-bounce {
            display: inline-block;
            animation: bounce 1s infinite;
          }
          @keyframes bounce {
            0%, 80%, 100% { transform: scale(1); }
            40% { transform: scale(1.5); }
          }
        `}</style>
      </div>
    );
  }