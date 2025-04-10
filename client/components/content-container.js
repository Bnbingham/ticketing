const ContentContainer = ({ children }) => {
  return (
    <div className='container'>
      <div className='row'>
        <div className='col-md-12 mt-5'>{children}</div>
      </div>
    </div>
  );
};

export default ContentContainer;
