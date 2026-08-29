function ForgotPassword() {
  return (
    <div className="auth-container">

      <form className="auth-form">

        <h2>Forgot Password</h2>

        <input
          type="email"
          placeholder="Enter your email"
          required
        />

        <button type="submit">
          Reset Password
        </button>

      </form>

    </div>
  );
}

export default ForgotPassword;