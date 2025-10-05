// client/src/components/Spinner.jsx
function Spinner() {
    return (
      <div className="flex justify-center items-center p-8">
        <div
          className="w-12 h-12 rounded-full animate-spin
                      border-4 border-solid border-indigo-600 border-t-transparent"
        ></div>
      </div>
    );
  }
  export default Spinner;