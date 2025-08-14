import { useRouter } from "next/router";
import { useForm } from "react-hook-form";

export default function CreateClient() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      clientNo: "",
      fname: "",
      lname: "",
      telno: "",
      street: "",
      city: "",
      email: "",
      preftype: "",
      maxrent: "",
    },
  });

  const submitForm = async (data) => {
    console.log("data submit ", data);
    try {
      const response = await fetch("https://dbs501-backend.onrender.com/client", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        console.log("Client created successfully!");
        router.replace("/client");
      } else {
        console.error("Error creating client:", response.statusText);
        alert("Failed to create client. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div
      style={{
        backgroundImage: `url(/staff-image.jpg)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        opacity: 0.8,
        backgroundColor: "white",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
          borderWidth: 2,
          borderStyle: "solid",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          width: "40%",
          borderRadius: 8,
        }}
      >
        <h1 style={{ textAlign: "center", marginBottom: "20px" }}>Create New Client</h1>
        <form onSubmit={handleSubmit(submitForm)} style={{ width: "100%" }}>
          <div style={{ marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label style={{ fontWeight: "bold", fontSize: "14px", marginRight: "10px" }}>Client Number</label>
            <input
              {...register("clientNo", { required: "This field is required" })}
              style={{ width: "80%", padding: 10, fontSize: "14px" }}
            />
            {errors.clientNo && <p style={{ color: "red" }}>{errors.clientNo.message}</p>}
          </div>

          <div style={{ marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label style={{ fontWeight: "bold", fontSize: "14px", marginRight: "10px" }}>First Name</label>
            <input
              {...register("fname", { required: "This field is required" })}
              style={{ width: "80%", padding: 10, fontSize: "14px" }}
            />
            {errors.fname && <p style={{ color: "red" }}>{errors.fname.message}</p>}
          </div>

          <div style={{ marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label style={{ fontWeight: "bold", fontSize: "14px", marginRight: "10px" }}>Last Name</label>
            <input
              {...register("lname", { required: "This field is required" })}
              style={{ width: "80%", padding: 10, fontSize: "14px" }}
            />
            {errors.lname && <p style={{ color: "red" }}>{errors.lname.message}</p>}
          </div>

          <div style={{ marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label style={{ fontWeight: "bold", fontSize: "14px", marginRight: "10px" }}>Telephone Number</label>
            <input
              {...register("telno", { required: "This field is required" })}
              style={{ width: "80%", padding: 10, fontSize: "14px" }}
            />
            {errors.telno && <p style={{ color: "red" }}>{errors.telno.message}</p>}
          </div>

          <div style={{ marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label style={{ fontWeight: "bold", fontSize: "14px", marginRight: "10px" }}>Street</label>
            <input
              {...register("street", { required: "This field is required" })}
              style={{ width: "80%", padding: 10, fontSize: "14px" }}
            />
            {errors.street && <p style={{ color: "red" }}>{errors.street.message}</p>}
          </div>

          <div style={{ marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label style={{ fontWeight: "bold", fontSize: "14px", marginRight: "10px" }}>City</label>
            <input
              {...register("city", { required: "This field is required" })}
              style={{ width: "80%", padding: 10, fontSize: "14px" }}
            />
            {errors.city && <p style={{ color: "red" }}>{errors.city.message}</p>}
          </div>

          <div style={{ marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label style={{ fontWeight: "bold", fontSize: "14px", marginRight: "10px" }}>Email</label>
            <input
              {...register("email", { required: "This field is required" })}
              style={{ width: "80%", padding: 10, fontSize: "14px" }}
            />
            {errors.email && <p style={{ color: "red" }}>{errors.email.message}</p>}
          </div>

          <div style={{ marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label style={{ fontWeight: "bold", fontSize: "14px", marginRight: "10px" }}>Preferred Type</label>
            <select
              {...register("preftype", { required: "This field is required" })}
              style={{ width: "80%", padding: 10, fontSize: "14px" }}
            >
              <option value="">--Select an option--</option>
              <option value="House">House</option>
              <option value="Flat">Flat</option>
            </select>
            {errors.preftype && <p style={{ color: "red" }}>{errors.preftype.message}</p>}
          </div>


          <div style={{ marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label style={{ fontWeight: "bold", fontSize: "14px", marginRight: "10px" }}>Max Rent</label>
            <input
              {...register("maxrent", { required: "This field is required" })}
              style={{ width: "80%", padding: 10, fontSize: "14px" }}
            />
            {errors.maxrent && <p style={{ color: "red" }}>{errors.maxrent.message}</p>}
          </div>

          <div style={{ display: "flex", justifyContent: "center", marginTop: "10px" }}>
            <button
              type="submit"
              style={{
                backgroundColor: "#4CAF50",
                color: "white",
                padding: "14px 20px",
                border: "none",
                cursor: "pointer",
                width: "20%",
                borderRadius: "5px",
              }}
            >
              Save
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}