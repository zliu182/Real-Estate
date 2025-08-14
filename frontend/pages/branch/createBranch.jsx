import { useRouter } from "next/router";
import { useForm } from "react-hook-form";

export default function CreateBranch() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    const requestData = {
      branch_no: data.branchNo,  // Renamed to match backend
      street: data.street,
      city: data.city,
      postal_code: data.postalCode,  // Renamed to match backend
    };

    try {
      const response = await fetch("https://dbs501-backend.onrender.com/branch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push("/branch"); // Redirect to the branch page on success
      } else {
        alert("Error creating branch");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("An error occurred while creating the branch.");
    }
  };

  return (
    <>
      <div
        style={{
          backgroundImage: `url(/staff-image.jpg)`, // Set the image as the background (replace with your image path)
          backgroundSize: "cover", // Cover the entire container
          backgroundPosition: "center", // Center the image
          height: "100vh", // Full screen height
          display: "flex", // Use flexbox for centering content
          justifyContent: "center", // Center horizontally
          alignItems: "center", // Center vertically
          position: "relative", // Ensures positioning of content inside
          opacity: 0.8,
          backgroundColor: "white",
          flexDirection: "column", // Stack the heading and form vertically
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: 10,
            borderWidth: 2,
            borderStyle: "solid",
            backgroundColor: "rgba(255, 255, 255, 0.9)", // Light background for the form
            padding: 20,
            borderRadius: 8,
            width: "40%",
            flexDirection: "column", // Stack the heading and form
          }}
        >
          <h1 style={{ color: "black", padding: "20px", textAlign: "center" }}>Create New Branch</h1>
          <form onSubmit={handleSubmit(onSubmit)} style={{ width: "100%" }}>
            <div>
              <div style={{ marginBottom: 10 }}>

                {/* Make sure the name is consistent with requestData */}
                <label style={{ fontWeight: "bold" }}>Branch Number</label>
                <input
                  {...register("branch_no", { required: true })}
                  style={{ width: "100%", padding: 10, marginTop: 5 }}
                />
                {errors.branchNo && <p style={{ color: "red" }}>This field is required</p>}
              </div>

              <div style={{ marginBottom: 10 }}>
                <label style={{ fontWeight: "bold" }}>Street</label>
                <input
                  {...register("street", { required: true })}
                  style={{ width: "100%", padding: 10, marginTop: 5 }}
                />
                {errors.street && <p style={{ color: "red" }}>This field is required</p>}
              </div>

              <div style={{ marginBottom: 10 }}>
                <label style={{ fontWeight: "bold" }}>City</label>
                <input
                  {...register("city", { required: true })}
                  style={{ width: "100%", padding: 10, marginTop: 5 }}
                />
                {errors.city && <p style={{ color: "red" }}>This field is required</p>}
              </div>

              <div style={{ marginBottom: 10 }}>
                <label style={{ fontWeight: "bold" }}>Postal Code</label>
                <input
                  {...register("postal_code", { required: true })}
                  style={{ width: "100%", padding: 10, marginTop: 5 }}
                />
                {errors.postalCode && <p style={{ color: "red" }}>This field is required</p>}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 20,
                }}
              >
                <button
                  type="submit"
                  style={{
                    padding: 10,
                    margin: 10,
                    backgroundColor: "#28a745",
                    color: "white",
                    border: 1,
                    borderRadius: 5,
                    cursor: "pointer",
                  }}
                >
                  <h3>Save</h3>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}