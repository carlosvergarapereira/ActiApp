// frontend/src/services/authService.js
export const login = async (username, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (username === 'admin' && password === '1234') {
        resolve({
          token: 'fake-jwt-token',
          user: {
            username: 'admin',
            email: 'admin@fake.com'
          }
        });
      } else {
        reject('Credenciales inválidas');
      }
    }, 1000);
  });
};
