import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Register from './components/Register';  // Import Register component
import Login from './components/Login';  // Import Login component

function App() {
  return (
    <Router>
      <div>
        <h1>Welcome to the Mentorship Platform</h1>
        <Switch>
          <Route path="/register" component={Register} />
          <Route path="/login" component={Login} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
