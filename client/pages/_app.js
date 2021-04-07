import 'bootstrap/dist/css/bootstrap.css';
import buildClient from '../api/build-client';
import Header from '../components/Header';
import LandingPage from './index';

const AppComponent = () => {
  return (
    <div>
      <h1>Simple header</h1>
      <div className="container">
        <LandingPage />
      </div>
    </div>
  );
};

export default AppComponent;
