const oracledb = require('oracledb')
const express = require('express')
const cors = require('cors')

const app = express()
const port = 3001

// Middleware to parse JSON request bodies
app.use(express.json())
app.use(cors()) // Pass cors function

// Database connection configuration
const dbConfig = {
  user: 'dbs501_243v1a09',
  password: '19131160',
  connectString: 'myoracle12c.senecacollege.ca:1521/oracle12c',
}

// Simulated in-memory hash-map for staff lookup
let staffHashMap = new Map()

// Function to populate staff hash-map
async function populateStaffHashMap() {
  try {
    const query = 'SELECT staffno, salary, telephone, email FROM dh_staff'
    const result = await executeQuery(query)

    staffHashMap.clear()
    result.rows.forEach((row) => {
      const [staffno, salary, telephone, email] = row
      staffHashMap.set(staffno, { salary, telephone, email })
    })

    console.log('Staff hash-map populated successfully!')
  } catch (err) {
    console.error('Error populating staff hash-map:', err)
  }
}

// Function to execute queries
async function executeQuery(query, binds = {}, options = {}) {
  let connection

  try {
    connection = await oracledb.getConnection(dbConfig)
    const result = await connection.execute(query, binds, options)
    return result
  } catch (err) {
    throw err
  } finally {
    if (connection) {
      try {
        await connection.close()
      } catch (err) {
        console.error('Error closing connection:', err)
      }
    }
  }
}

// Main page route
app.get('/', (req, res) => {
  res.send('Welcome to the main page!')
})

// GET method for retrieving all staff records
app.get('/staff', async (req, res) => {
  try {
    const query = 'SELECT * FROM dh_staff'
    const result = await executeQuery(query)

    const columnNames = [
      'staff_id',
      'first_name',
      'last_name',
      'position',
      'gender',
      'dob',
      'salary',
      'branch_id',
      'telephone_ext',
      'mobile_number',
      'email',
    ]

    const jsonResult = result.rows.map((row) => {
      return columnNames.reduce((obj, col, index) => {
        obj[col] = row[index]
        return obj
      }, {})
    })

    res.json(jsonResult) // Sends the staff data as JSON
  } catch (err) {
    res.status(500).send('Error retrieving staff data')
  }
})

// POST method to hire new staff using the stored procedure
app.post('/staff', async (req, res) => {
  console.log('====================')
  try {
    // SQL query to call the stored procedure
    const query = `BEGIN Staff_hire_sp; END;`

    // Execute the stored procedure
    await executeQuery(query)

    // Repopulate the staff hash-map after updating the database
    await populateStaffHashMap()

    res.status(201).send('New staff hired successfully using Staff_hire_sp')
  } catch (err) {
    console.error('Error hiring staff:', err.message)

    // Handle specific error messages
    if (err.message.includes('unique constraint')) {
      res.status(409).send('Staff already exists')
    } else {
      res.status(500).send('Error hiring staff')
    }
  }
})

// PUT method to update staff information
app.put('/staff', async (req, res) => {
  console.log('====================')
  const { staffNo, position, salary, telephone, email } = req.body

  if (!staffNo) {
    return res.status(400).send('Staff number is required')
  }

  if (!staffHashMap.has(staffNo)) {
    return res.status(404).send(`Staff number ${staffNo} not found`)
  }

  try {
    const query = `  BEGIN
        UPDATE dh_staff
        SET
          salary = :p_salary,
          telephone = :p_telephone,
          email = :p_email,
          position = :p_position
        WHERE staffno = :p_staffno;

        COMMIT;
      END;`
    const binds = {
      p_staffno: staffNo,
      p_salary: salary || null,
      p_telephone: telephone || null,
      p_email: email || null,
      p_position: position || null
    }

    await executeQuery(query, binds)

    // Update in-memory hash-map
    const updatedStaff = staffHashMap.get(staffNo)
    if (salary) updatedStaff.salary = salary
    if (telephone) updatedStaff.telephone = telephone
    if (email) updatedStaff.email = email

    staffHashMap.set(staffNo, updatedStaff)

    // Send back the updated staff data in an array format
    res.json([updatedStaff]) // Return the updated staff info as an array
  } catch (err) {
    console.error(err)
    res.status(500).send('Error updating staff information')
  }
})

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
  populateStaffHashMap() // Populate the hash-map at startup
})
