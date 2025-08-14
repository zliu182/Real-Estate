import { useState, useEffect } from 'react'; // Import useState and useEffect
import { useRouter } from 'next/router';  // Import useRouter for navigation

const BranchDetail = () => {
  const router = useRouter();
  const { branchNo } = router.query;  // Access branchNo from URL query parameter

  const [branchDetails, setBranchDetails] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (branchNo) {
      fetch(`https://dbs501-backend.onrender.com/branch/${branchNo}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.branch) {
            setBranchDetails(data.branch);
            setError(""); // Clear error if branch is found
          } else {
            setError("Branch not found.");
          }
        })
        .catch((err) => {
          console.error("Error fetching branch:", err);
          setError("Failed to fetch branch data.");
        });
    }
  }, [branchNo]);

  if (error) {
    return <div>{error}</div>;
  }

  if (!branchDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div
      style={{
        backgroundImage: `url('/staff-image.jpg')`, // Set the background image
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        display: 'flex',  // Flexbox for centering content
        justifyContent: 'center', // Center horizontally
        alignItems: 'center', // Center vertically
        padding: '20px',
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.8)', // Light transparent background
          borderRadius: '10px', // Optional: rounded corners for a nice effect
          padding: '30px', // Padding around the content
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Optional: slight shadow for depth
        }}
      >
        <h1 style={{ color: 'black' }}>Branch Details</h1>
        <p><strong>Branch Number:</strong> {branchDetails.branch_no}</p>
        <p><strong>Street:</strong> {branchDetails.street}</p>
        <p><strong>City:</strong> {branchDetails.city}</p>
        <p><strong>Postcode:</strong> {branchDetails.postal_code}</p>

        {/* Button to return to /branch page */}
        <button
          onClick={() => router.push('/branch')} // Navigate to /branch
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: 'light grey', // Button background color
            color: 'black',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold', // Make the text bold
          }}
        >
          Back to Branches
        </button>
      </div>
    </div>
  );
};

export default BranchDetail;