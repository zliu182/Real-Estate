import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Spreadsheet, { DataViewer } from "react-spreadsheet";

const column = {
  BRANCHNO: 0,
  STREET: 1,
  CITY: 2,
  POSTCODE: 3,
};

export default function BranchPage() {
  const [data, setData] = useState([]); // All branches data
  const [reset, setReset] = useState(false);
  const [branchNo, setBranchNo] = useState(""); // State for branch number input
  const [branchDetails, setBranchDetails] = useState(null); // State for branch details
  const [error, setError] = useState(""); // State for error messages
  const [updatedData, setUpdatedData] = useState(new Map()); // State to store updated employee data
  const [activeCell, setActiveCell] = useState({ row: -1, column: -1 }); // Active cell state for detecting which cell is being edited
  const [userData, setUserData] = useState(""); // Declare state for userData

  const router = useRouter();
  const columnLabels = ["Branch Number", "Street", "City", "Postcode"];

  useEffect(() => {
    // Fetch all branch data
    fetch("https://dbs501-backend.onrender.com/branch", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((branchData) => {
        // Format the data to match Spreadsheet requirements
        const formattedData = branchData.map((branch) => [
          { value: branch.branch_no, readOnly: true },
          { value: branch.street },
          { value: branch.city },
          { value: branch.postal_code },
        ]);
        setData(formattedData);
      })
      .catch((err) => {
        console.error("Error fetching branch data:", err);
      });

    setReset(false);
  }, [reset]);

  const handleSearch = async () => {
    if (!branchNo.trim()) {
      setError("Please enter a branch number.");
      setBranchDetails(null);
      return;
    }

    try {
      const response = await fetch(`https://dbs501-backend.onrender.com/branch/${branchNo.trim()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBranchDetails(data.branch);
        setError(""); // Clear any previous error
        router.push(`/branch/${branchNo.trim()}`);  // Navigate to the specific branch details page
      } else if (response.status === 404) {
        setBranchDetails(null);
        setError("Branch not found.");
      } else {
        setBranchDetails(null);
        setError("An error occurred while searching for the branch.");
      }
    } catch (err) {
      console.error("Error fetching branch:", err);
      setBranchDetails(null);
      setError("Failed to connect to the server.");
    }
  };

  const handleReset = () => {
    setReset(true);
    setBranchNo("");
    setBranchDetails(null);
    setError("");
  };

  const handleAddNewBranch = () => {
    router.push("/branch/createBranch"); // Make sure to access the create page
  };

  const DropdownViewer = ({ cell }) => {
    return (
      <select
        value={cell.value}
        onChange={(e) => {
          const street = data[activeCell.row][column.STREET].value;
          const city = data[activeCell.row][column.CITY].value;
          const postcode = data[activeCell.row][column.POSTCODE].value;

          setUpdatedData((prevData) => {
            const newData = new Map(prevData);

            newData.set(branchNo, {
              branchNo: branchNo,
              street: street,
              city: city,
              postcode: postcode,
            });
            return newData;
          });

          // Update the cell value
          cell.value = e.target.value;

          // Call the updateData function to update specific fields
          updateData(cell.value);
        }}
        style={{ width: "100%", height: "100%" }}
      >
        {/* No hardcoded options */}
      </select>
    );
  };

  const CustomDataViewer = (props) => {
    const { cell, setCellData } = props;
    if (cell && cell.type === "dropdown") {
      return <DropdownViewer cell={cell} onChange={setCellData} />;
    }
    return <DataViewer {...props} />;
  };

  const handleChange = (newData) => {
    setData(newData);
  };

  const handleOnKey = (e) => {
    // Ensure activeCell is not null before accessing it
    if (activeCell && activeCell.row != null && activeCell.column != null) {
      const cellData = data[activeCell.row][activeCell.column];
      const street = data[activeCell.row][column.STREET].value;
      const city = data[activeCell.row][column.CITY].value;
      const postcode = data[activeCell.row][column.POSTCODE].value;

      setUpdatedData((prevData) => {
        const newData = new Map(prevData); // Clone the current Map
        newData.set(branchNo, {
          branchNo: branchNo,
          street: street,
          city: city,
          postcode: postcode,
        });
        return newData;
      });

      // Handling the key input for branch data updates
      if (/^[a-zA-Z0-9]$/.test(e.key)) {
        setUserData(() => {
          let data = cellData?.value;
          let finalCellData = "";
          if (data) {
            finalCellData = data + e.key;
          } else {
            finalCellData = e.key;
          }

          updateData(finalCellData);

          return finalCellData;
        });
      } else if (e.key === "Backspace") {
        setUserData(() => {
          let currentData = cellData?.value.slice(0, -1);

          updateData(currentData);

          return currentData;
        });
      }
    }
  };

  const updateData = (recentInput) => {
    // Get the current data of the branch being edited
    let currentData = updatedData.get(branchNo);

    if (!currentData) {
      // If no data exists for the current branchNo, create a new data structure
      currentData = {
        branchNo: branchNo, // Assuming the branch number is in the first column
        street: data[activeCell.row][column.STREET].value,
        city: data[activeCell.row][column.CITY].value,
        postcode: data[activeCell.row][column.POSTCODE].value,
      };


      // Update the specific field based on which column was changed
      let updatingData = undefined;

      if (activeCell.column === column.STREET) {
        updatingData = { ...currentData, street: recentInput };
      } else if (activeCell.column === column.CITY) {
        updatingData = { ...currentData, city: recentInput };
      } else if (activeCell.column === column.POSTCODE) {
        updatingData = { ...currentData, postcode: recentInput };
      }

      // Save the updated branch data back to the state
      setUpdatedData((prevData) => {
        const newData = new Map(prevData);
        newData.set(branchNo, updatingData); // Use branchNo as the key
        return newData;
      });
    }
  };

  const handleActive = (active) => {
    setActiveCell(active);
    setBranchNo(data[active.row][column.BRANCHNO].value);

    setUserData("");
  };

  const handleSave = async () => {
    try {
      for (const d of updatedData.values()) {
        const response = await fetch("https://dbs501-backend.onrender.com//branch", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(d),
        });

        if (!response.ok) {
          // Handle non-2xx HTTP status codes
          const errorData = await response.json();
          console.error("Response error:", errorData);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log("Updated branch status:", response.status);
      }

      setReset(true); // Reset the data to reflect the changes
    } catch (error) {
      console.error("Error saving updated data:", error);
      if (error.message) {
        console.error("Error message:", error.message);
      }
    }
  };

  return (
    <div
      style={{
        backgroundImage: `url(/staff-image.jpg)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "100vh",
        position: "relative",
        opacity: 0.8,
        backgroundColor: "white",
      }}
    >
      <h1 style={{ color: "black", padding: 20 }}>Branch Information</h1>

      {/* Search Section */}
      <div
        style={{
          justifyContent: "center",
          alignItems: "center",
          display: "flex",
          padding: 10,
          gap: 10,
        }}
      >
        <input
          type="text"
          value={branchNo}
          placeholder="Search Branch Number"
          onChange={(e) => setBranchNo(e.target.value)}
          style={{
            padding: "10px",
            fontSize: "16px",
            width: "300px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />
        <button style={{ padding: 10 }} onClick={handleSearch}>
          <h3>Search</h3>
        </button>
      </div>

      {/* Error or Search Result */}
      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
      {branchDetails && (
        <div style={{ marginTop: "20px", fontSize: "18px", textAlign: "center" }}>
          <h2>Branch Details</h2>
          <p>
            <strong>Branch Number:</strong> {branchDetails.branch_no}
          </p>
          <p>
            <strong>Street:</strong> {branchDetails.street}
          </p>
          <p>
            <strong>City:</strong> {branchDetails.city}
          </p>
          <p>
            <strong>Postcode:</strong> {branchDetails.postal_code}
          </p>
        </div>
      )}

      {/* Spreadsheet Section */}
      <div
        style={{
          borderWidth: 1,
          borderStyle: "solid",
          display: "flex",
          justifyContent: "center",
          maxHeight: "50%",
          marginTop: 20,
        }}
      >
        <Spreadsheet
          data={data}
          columnLabels={columnLabels}
          onChange={(data) => handleChange(data)}
          onKeyDown={(e) => handleOnKey(e)}
          hideRowIndicators={true}
          onActivate={(active) => {
            handleActive(active); // Call handleActive for update
          }}
          onCellEdit={(cell) => {
            setActiveCell(cell);
            updateData(cell.value);  // Trigger update when a cell is edited
          }}
          DataViewer={CustomDataViewer}
        />
      </div>

      {/* Reset Button */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 50,
          marginTop: 20,
        }}
      >
        <button style={{ padding: 10 }} onClick={handleReset}>
          <h3>Reset</h3>
        </button>
        <button style={{ padding: 10 }} onClick={handleAddNewBranch}>
          <h3>Add new branch</h3>
        </button>
        <button style={{ padding: 10 }} onClick={handleSave}>
          <h3>Save</h3>
        </button>
      </div>
    </div>
  );
}