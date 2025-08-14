import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Spreadsheet, { DataViewer } from "react-spreadsheet";

const column = {
  CLIENTNO: 0,
  TELNO: 3,
  EMAIL: 4,
  PREFTYPE: 5,
  MAXRENT: 6,
};

export default function StaffPage() {
  const [data, setData] = useState([]);
  const [reset, setReset] = useState(false);
  const [activeCell, setActiveCell] = useState({ row: -1, column: -1 });
  const [clientNumSelected, setClientNumSelected] = useState("N/A");
  const [userData, setUserData] = useState("");
  const [updatedData, setUpdatedData] = useState(new Map());

  useEffect(() => {
    fetch("https://dbs501-backend.onrender.com/client", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        const formattedData = data.map((item) => {
          const itemData = [
            { value: item.client_id, readOnly: true },
            { value: item.first_name, readOnly: true },
            { value: item.last_name, readOnly: true }, // Set read-only to prevent disappear
            { value: item.telephone },
            { value: item.email },
            { value: item.prefer_type, type: "dropdown" },
            { value: item.max_rent },
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
    "Client Number",
    "First Name",
    "Last Name",
    "Phone",
    "Email",
    "Pref Type",
    "Max Rent"
  ];

  const DropdownViewer = ({ cell }) => {
    return (
      <select
        value={cell.value}
        onChange={(e) => {
          const telno = data[activeCell.row][column.TELNO].value;
          const email = data[activeCell.row][column.EMAIL].value;
          const preftype = data[activeCell.row][column.PREFTYPE].value;
          const maxrent = data[activeCell.row][column.MAXRENT].value;

          setUpdatedData((prevData) => {
            const newData = new Map(prevData);
            newData.set(clientNumSelected, {
              clientno: clientNumSelected,
              telno: telno,
              email: email,
              preftype: preftype,
              maxrent: maxrent,
            });
            return newData;
          });

          cell.value = e.target.value;

          updateData(cell.value);

          //add to the array to be sent to UPDATE API
        }}
        style={{ width: "100%", height: "100%" }}
      >
        <option value="Flat">Flat</option>
        <option value="House">House</option>
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
      const cellData = data[activeCell.row][activeCell.column]; // Get the cell data using activeCell row and column
      const telno = data[activeCell.row][column.TELNO].value;
      const email = data[activeCell.row][column.EMAIL].value;
      const preftype = data[activeCell.row][column.PREFTYPE].value;
      const maxrent = data[activeCell.row][column.MAXRENT].value;

      // Update the Map of updatedData with the new cell data
      setUpdatedData((prevData) => {
        const newData = new Map(prevData); // Clone the current Map
        newData.set(clientNumSelected, {
          clientno: clientNumSelected,
          telno: telno,
          email: email,
          preftype: preftype,
          maxrent: maxrent,
        });
        return newData;
      });

      // Handle key input for alphanumeric characters or Backspace
      if (/^[a-zA-Z0-9]$/.test(e.key)) {
        setUserData(() => {
          let dataValue = cellData?.value; // Access the current cell's value
          let finalCellData = "";
          if (dataValue) {
            finalCellData = dataValue + e.key;
          } else {
            finalCellData = e.key;
          }

          updateData(finalCellData);

          return finalCellData;
        });
      } else if (e.key === "Backspace") {
        setUserData((prevData) => {
          let currentData = prevData.slice(0, -1); // Remove the last character

          updateData(currentData);

          return currentData;
        });
      }
    }
  };

  const updateData = (recentInput) => {
    let currentData = updatedData.get(clientNumSelected);

    // If current data not exist, need to populate the current data with the current row data
    if (!currentData) {
      currentData = {
        clientno: clientNumSelected,
        telno: data[activeCell.row][column.TELNO].value,
        email: data[activeCell.row][column.EMAIL].value,
        preftype: data[activeCell.row][column.PREFTYPE].value,
        maxrent: data[activeCell.row][column.MAXRENT].value,
      };
    }
    let updatingData = undefined;

    if (activeCell.column == column.TELNO) {
      updatingData = { ...currentData, telno: recentInput };
    } else if (activeCell.column == column.EMAIL) {
      updatingData = { ...currentData, email: recentInput };
    } else if (activeCell.column == column.PREFTYPE) {
      updatingData = { ...currentData, preftype: recentInput };
    } else if (activeCell.column == column.MAXRENT) {
      updatingData = { ...currentData, maxrent: recentInput };
    }

    setUpdatedData((prevData) => {
      const newData = new Map(prevData);
      newData.set(clientNumSelected, updatingData);
      return newData;
    });
  };

  const handleActive = (active) => {
    setActiveCell(active);
    setClientNumSelected(data[active.row][column.CLIENTNO].value);

    setUserData("");
  };

  const handleCreateClient = () => {
    router.push("/client/createClient");
  };

  const handleReset = () => {
    setReset(true);
  };

  const handleSave = async () => {
    // Send API of updatedData
    for (const data of updatedData.values()) {
      try {
        const response = await fetch(`https://dbs501-backend.onrender.com/client`, {
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
        console.error("Error updating client:", error);
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
        <h1 style={{ color: "black", padding: 20 }}>Client Information</h1>

        <div
          style={{
            borderWidth: 1,
            borderStyle: "solid",
            top: "30%",
            display: "flex",
            justifyContent: "center",
            alignSelf: "center", // Remove maxheight to adjust the ui display
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
          <button style={{ padding: 10 }} onClick={handleCreateClient}>
            <h3>Add new client</h3>
          </button>
          <button style={{ padding: 10 }} onClick={handleSave}>
            <h3>Save</h3>
          </button>
        </div>
      </div>
    </>
  );
}