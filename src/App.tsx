import { createEffect, JSX } from 'solid-js';
import { useNavigate } from '@solidjs/router';


function App(): JSX.Element {
  // const [user, setUser] = createSignal(null);
  const navigate = useNavigate();

  // make a fake user for now
  // setUser({ id: 1, name: 'Sarah Jones', role: 'Dentist' });

  // Initialize mock data
  createEffect(() => {
    // initializeMockApi();
  });

  // const logout = () => {
  //   setUser(null);
  //   // make a fake user
  //   navigate('/login', { replace: true });
  // };

  navigate('/dashboard', { replace: true });
  return <></>
  // return (
  //   <div class="min-h-screen bg-gray-50">
  //     {user() ? (
  //       <Dashboard />
  //     ) : (
  //       <Login setUser={setUser} />
  //     )}
  //   </div>
  // );
}


export default App;
