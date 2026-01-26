import UserDataFormStyled from "../components/UserDataFormStyled";

const UserDataPage = () => {
  const handleSubmit = (data) => {
    console.log("Datos del usuario:", data);
  };

  return <UserDataFormStyled onSubmit={handleSubmit} />;
};

export default UserDataPage;


