export async function load({ locals }) {
  const currentUser = locals.currentUser;
  return {
    currentUser
  };
}
