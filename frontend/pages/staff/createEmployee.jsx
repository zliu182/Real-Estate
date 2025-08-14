import { useRouter } from "next/router";
import { useForm } from "react-hook-form";

export default function CreateEmployee() {
  const router = useRouter();
  const { register, handleSubmit, formState } = useForm({
    defaultValues: {
      staffNo: "",
      firstName: "",
      lastName: "",
      sex: "",
      DOB: "",
      salary: "",
      branchNo: "",
      telephone: "",
      mobile: "",
      email: "",
    },
  });

  const submitForm = async (data) => {
    const dob = new Date(data.DOB);
    const formattedDOB = dob.toISOString().split('T')[0];
    data.DOB = formattedDOB;

    try {
      const response = await fetch("https://dbs501-backend.onrender.com/staff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          staffno: data.staffNo,
          fname: data.firstName,
          lname: data.lastName,
          position: "Employee", // Example position, you can adjust
          sex: data.sex,
          dob: data.DOB,
          salary: data.salary,
          branchno: data.branchNo,
          telephone: data.telephone,
          mobile: data.mobile,
          email: data.email,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Employee created successfully:", result);
        router.replace("/staff"); // Navigate to staff page after success
      } else {
        const errorMessage = await response.text();
        console.error("Error creating employee:", errorMessage);
        alert(`Failed to create employee: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Error during submission:", error);
      alert("An error occurred while submitting the form.");
    }
  };

  return (
    <>
      <div
        style={{
          backgroundImage: `url(/staff-image.jpg)`, // Set the image as the background
          backgroundSize: "cover", // Cover the entire container
          backgroundPosition: "center", // Center the image
          height: "100vh", // Full screen height
          position: "relative", // Ensures positioning of content inside
          opacity: 0.8,
          backgroundColor: "white",
          display: "flex", // Use flexbox for centering content
          justifyContent: "center", // Center horizontally
          alignItems: "center", // Center vertically
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
            flexDirection: "column", // Stack form fields vertically
          }}
        >
          <h1 style={{ textAlign: "center", marginBottom: "20px" }}>Create New Employee</h1>
          <form onSubmit={handleSubmit(submitForm)} style={{ width: "100%" }}>
            <div style={{ marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label style={{ fontWeight: "bold", fontSize: "14px", marginRight: "10px" }}>Staff Number</label>
              <input
                {...register("staffNo", { required: "This field is required" })}
                style={{ width: "80%", padding: 10, fontSize: "14px" }}
              />
              {formState.errors.staffNo && <p style={{ color: "red" }}>{formState.errors.staffNo.message}</p>}
            </div>

            <div style={{ marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label style={{ fontWeight: "bold", fontSize: "14px", marginRight: "10px" }}>First Name</label>
              <input
                {...register("firstName", { required: "This field is required" })}
                style={{ width: "80%", padding: 10, fontSize: "14px" }}
              />
              {formState.errors.firstName && <p style={{ color: "red" }}>{formState.errors.firstName.message}</p>}
            </div>

            <div style={{ marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label style={{ fontWeight: "bold", fontSize: "14px", marginRight: "10px" }}>Last Name</label>
              <input
                {...register("lastName", { required: "This field is required" })}
                style={{ width: "80%", padding: 10, fontSize: "14px" }}
              />
              {formState.errors.lastName && <p style={{ color: "red" }}>{formState.errors.lastName.message}</p>}
            </div>

            <div style={{ marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label style={{ fontWeight: "bold", fontSize: "14px", marginRight: "10px" }}>Position</label>
              <select
                {...register("preftype", { required: "This field is required" })}
                style={{ width: "80%", padding: 10, fontSize: "14px" }}
              >
                <option value="">--Select an option--</option>
                <option value="Assistant">Assistant</option>
                <option value="Supervisor">Supervisor</option>
                <option value="Manager">Manager</option>
              </select>
              {formState.errors.lastName && <p style={{ color: "red" }}>{formState.errors.lastName.message}</p>}
            </div>

            <div style={{ marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label style={{ fontWeight: "bold", fontSize: "14px", marginRight: "10px" }}>Sex</label>
              <input
                {...register("sex", { required: "This field is required" })}
                placeholder="M/F"
                style={{ width: "80%", padding: 10, fontSize: "14px" }}
              />
              {formState.errors.sex && <p style={{ color: "red" }}>{formState.errors.sex.message}</p>}
            </div>

            <div style={{ marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label style={{ fontWeight: "bold", fontSize: "14px", marginRight: "10px" }}>Date of Birth</label>
              <input
                type="date"
                {...register("DOB", { required: "This field is required" })}
                style={{ width: "80%", padding: 10, fontSize: "14px" }}
              />
              {formState.errors.DOB && <p style={{ color: "red" }}>{formState.errors.DOB.message}</p>}
            </div>

            <div style={{ marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label style={{ fontWeight: "bold", fontSize: "14px", marginRight: "10px" }}>Salary</label>
              <input
                {...register("salary", { required: "This field is required" })}
                style={{ width: "80%", padding: 10, fontSize: "14px" }}
              />
              {formState.errors.salary && <p style={{ color: "red" }}>{formState.errors.salary.message}</p>}
            </div>

            <div style={{ marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label style={{ fontWeight: "bold", fontSize: "14px", marginRight: "10px" }}>Branch No</label>
              <input
                {...register("branchNo", { required: "This field is required" })}
                style={{ width: "80%", padding: 10, fontSize: "14px" }}
              />
              {formState.errors.branchNo && <p style={{ color: "red" }}>{formState.errors.branchNo.message}</p>}
            </div>

            <div style={{ marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label style={{ fontWeight: "bold", fontSize: "14px", marginRight: "10px" }}>Telephone</label>
              <input
                {...register("telephone", { required: "This field is required" })}
                style={{ width: "80%", padding: 10, fontSize: "14px" }}
              />
              {formState.errors.telephone && <p style={{ color: "red" }}>{formState.errors.telephone.message}</p>}
            </div>

            <div style={{ marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label style={{ fontWeight: "bold", fontSize: "14px", marginRight: "10px" }}>Mobile</label>
              <input
                {...register("mobile", { required: "This field is required" })}
                style={{ width: "80%", padding: 10, fontSize: "14px" }}
              />
              {formState.errors.mobile && <p style={{ color: "red" }}>{formState.errors.mobile.message}</p>}
            </div>

            <div style={{ marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label style={{ fontWeight: "bold", fontSize: "14px", marginRight: "10px" }}>Email</label>
              <input
                type="email"
                {...register("email", { required: "This field is required" })}
                style={{ width: "80%", padding: 10, fontSize: "14px" }}
              />
              {formState.errors.email && <p style={{ color: "red" }}>{formState.errors.email.message}</p>}
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
    </>
  );
}