import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Spreadsheet, { DataViewer } from "react-spreadsheet";

const column = {
  STAFFNO: 0,
  POSITION: 3,
  SALARY: 4,
  PHONE: 5,
  EMAIL: 6,
};

export default function StaffPage() {
  const [data, setData] = useState([]);
  const [reset, setReset] = useState(false);
  const [activeCell, setActiveCell] = useState({ row: -1, column: -1 });
  const [employeeNumSelected, setEmployeeNumSelected] = useState("N/A");
  const [userData, setUserData] = useState("");
  const [updatedData, setUpdatedData] = useState(new Map());

  useEffect(() => {
    // Change the ports to fetch data from dh_staff
    fetch("https://dbs501-backend.onrender.com/staff", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const formattedData = data.map((item) => {
          const itemData = [
            { value: item.staff_id, readOnly: true },
            { value: item.first_name, readOnly: true },
            { value: item.last_name, readOnly: true },
            { value: item.position, type: "dropdown", readOnly: true },
            { value: item.salary.toString() },
            { value: item.mobile_number },
            { value: item.email },
          ];
          return itemData;
        });
        setData(formattedData);
      })
      .catch((err) => {
        console.error(err);
      });
    setReset(false);
  }, [reset]);

  const router = useRouter();

  const columnLabels = [
    "Staff Number",
    "First Name",
    "Last Name",
    "Position",
    "Salary",
    "Phone",
    "Email",
  ];

  const DropdownViewer = ({ cell }) => {
    return (
      <select
        value={cell.value}
        onChange={(e) => {
          const position = data[activeCell.row][column.POSITION].value;
          const salary = data[activeCell.row][column.SALARY].value;
          const phone = data[activeCell.row][column.PHONE].value;
          const email = data[activeCell.row][column.EMAIL].value;

          setUpdatedData((prevData) => {
            const newData = new Map(prevData);

            // Need staff number to update to the backend
            newData.set(employeeNumSelected, {
              staffNo: employeeNumSelected,
              position: position,
              salary: salary,
              telephone: phone, // The variable in backend schema must be consistent
              email: email,
            });
            return newData;
          });

          cell.value = e.target.value;

          updateData(cell.value);

          //add to the array to be sent to UPDATE API
        }}
        style={{ width: "100%", height: "100%" }}
      >
        <option value="Assistant">Assistant</option>
        <option value="Supervisor">Supervisor</option>
        <option value="Manager">Manager</option>
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
    if (activeCell.row >= 0 && activeCell.column >= 0) {
      const cellData = data[activeCell.row][activeCell.column];
      const position = data[activeCell.row][column.POSITION]?.value;
      const salary = data[activeCell.row][column.SALARY]?.value;
      const phone = data[activeCell.row][column.PHONE]?.value;
      const email = data[activeCell.row][column.EMAIL]?.value;

      setUpdatedData((prevData) => {
        const newData = new Map(prevData); // Clone the current Map
        newData.set(employeeNumSelected, {
          staffNo: employeeNumSelected,
          position: position,
          salary: salary,
          telephone: phone,
          email: email,
        });
        return newData;
      });

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
    let currentData = updatedData.get(employeeNumSelected);

    // If current data not exist, need to populate the current data with the current row data
    if (!currentData) {
      currentData = {
        staffNo: employeeNumSelected,
        position: data[activeCell.row][column.POSITION].value,
        salary: data[activeCell.row][column.SALARY].value,
        telephone: data[activeCell.row][column.PHONE].value,
        email: data[activeCell.row][column.EMAIL].value,
      };
    }
    let updatingData = undefined;

    if (activeCell.column === column.POSITION) {
      updatingData = { ...currentData, position: recentInput };
    } else if (activeCell.column === column.SALARY) {
      updatingData = { ...currentData, salary: recentInput };
    } else if (activeCell.column === column.PHONE) {
      updatingData = { ...currentData, phone: recentInput };
    } else if (activeCell.column === column.EMAIL) {
      updatingData = { ...currentData, email: recentInput };
    }

    setUpdatedData((prevData) => {
      const newData = new Map(prevData);
      newData.set(employeeNumSelected, updatingData);
      return newData;
    });
  };

  const handleActive = (active) => {
    setActiveCell(active);
    setEmployeeNumSelected(data[active.row][column.STAFFNO]?.value);
    setUserData("");
    // if (active.row >= 0 && active.column >= 0) {
    // }
  };

  const handleCreateEmp = () => {
    router.push("/staff/createEmployee");
  };

  const handleReset = () => {
    setReset(true);
  };

  const handleSave = async () => {
    // Send API of updatedData
    for (const data of updatedData.values()) {
      try {
        const response = await fetch(`https://dbs501-backend.onrender.com/staff`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          // Handle non-2xx HTTP status codes
          const errorData = await response.json();
          console.error("Response error:", errorData);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log("Update complete");
      } catch (error) {
        console.error("Error updating staff:", error);
      }
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
        }}
      >
        <h1 style={{ color: "black", padding: 20 }}>Staff Information</h1>

        <div
          style={{
            borderWidth: 1,
            borderStyle: "solid",
            top: "30%",
            display: "flex",
            justifyContent: "center",
            alignSelf: "center",
            top: 100,
          }}
        >
          <Spreadsheet
            data={data}
            columnLabels={columnLabels}
            onChange={(data) => handleChange(data)}
            onKeyDown={(e) => handleOnKey(e)}
            hideRowIndicators={true}
            onActivate={(active) => {
              handleActive(active);
            }}
            onCellEdit={(cell) => {
              // handleActive(cell); // This will call handleActive to set active cell
              // updateData(cell.value);  // Trigger update when a cell is edited
            }}
            DataViewer={CustomDataViewer}
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 50,
            marginTop: 10,
          }}
        >
          <button style={{ padding: 10 }} onClick={handleReset}>
            <h3>Reset</h3>
          </button>
          <button style={{ padding: 10 }} onClick={handleCreateEmp}>
            <h3>Add new employee</h3>
          </button>
          <button style={{ padding: 10 }} onClick={handleSave}>
            <h3>Save</h3>
          </button>
        </div>
      </div>
    </>
  );
}