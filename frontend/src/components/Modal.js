import React from 'react';

function Modal({ message, type, onClose }) {
  const icon = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'lose' ? '😞' : type === 'haha' ? '😂' : null;
  const overlayClasses = "fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center";
  const modalBoxClasses = type === 'error' ? 'bg-red-100' : type === 'success' ? 'bg-green-100' : type === 'gold' ? 'bg-yellow-500' : type === 'haha' ? 'bg-orange-400' : 'bg-white';
  const modalContentClasses = `${modalBoxClasses} p-5 z-50 shadow-lg rounded-md max-w-sm mx-auto`;

  return (
    <div className={overlayClasses} onClick={onClose}>
      <div className={modalContentClasses} onClick={e => e.stopPropagation()}>
        {icon && <div className="mb-4 text-center text-2xl">{icon}</div>}
        <p className="text-center mb-4">{message}</p>
        <div className="flex justify-center">
          <button onClick={onClose} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition-colors cursor-pointer">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default Modal;