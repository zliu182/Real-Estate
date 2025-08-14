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
    await connection.commit() // Ensure to update in the database
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

app.post('/staff', async (req, res) => {
  const {
    staffno,
    fname,
    lname,
    position,
    sex,
    dob, // Ensure dob is a valid date string
    salary,
    branchno,
    telephone,
    mobile,
    email,
  } = req.body

  // Validate input
  if (
    !staffno ||
    !fname ||
    !lname ||
    !position ||
    !sex ||
    !dob ||
    !salary ||
    !branchno ||
    !telephone ||
    !mobile ||
    !email
  ) {
    return res.status(400).send('All fields are required')
  }

  const newStaff = {
    staffno,
    fname,
    lname,
    position,
    sex,
    dob: new Date(dob),
    salary,
    branchno,
    telephone,
    mobile,
    email,
  }

  try {
    // Check if branchno exists in the parent table (assuming it's 'dh_branch' table)
    const checkBranchQuery = `SELECT branchno FROM dh_branch WHERE branchno = :branchno`

    console.log('Executing branch check query with branchno:', branchno) // Log the branchno being used
    const result = await executeQuery(checkBranchQuery, { branchno })
    console.log('Branch check result:', result) // Log the result of the query

    // Ensure result is valid before accessing the count
    if (!result || result.length === 0) {
      console.log('Branch not found.')
      return res.status(400).send('The branch does not exist.')
    }

    // SQL query to insert into the dh_staff table directly
    const query = `
      BEGIN
        INSERT INTO dh_staff ( -- Insert a new staff record into the dh_staff table
            staffno,
            fname,
            lname,
            position,
            sex,
            dob,
            salary,
            branchno,
            telephone,
            mobile,
            email
        ) VALUES (
            :staffno,
            :fname,
            :lname,
            :position,
            :sex,
            TO_DATE(:dob, 'YYYY-MM-DD'),
            :salary,
            :branchno,
            :telephone,
            :mobile,
            :email
        );
        COMMIT; -- Commit the transaction
      END;
    `

    // Bind values to the placeholders in the SQL query
    const binds = {
      staffno: staffno,
      fname: fname,
      lname: lname,
      position: position,
      sex: sex,
      dob: new Date(dob).toISOString().split('T')[0], // Convert date to 'YYYY-MM-DD' format
      salary: salary || null,
      branchno: branchno, // Matching placeholder :branchno
      telephone: telephone || null,
      mobile: mobile || null,
      email: email || null,
    }

    // Pass the binds object to the executeQuery function
    await executeQuery(query, binds)

    res.status(201).json({
      message: 'New staff hired successfully and record inserted into dh_staff',
      staff: newStaff,
    })
  } catch (err) {
    console.error('Error hiring staff:', err.message)

    if (err.message.includes('unique constraint')) {
      res.status(409).send('Staff already exists')
    } else {
      res.status(500).send('Error hiring staff')
    }
  }
})

// PUT method to update staff information
app.put('/staff', async (req, res) => {
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
      p_position: position || null,
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

app.get('/branch', async (req, res) => {
  try {
    const query = 'SELECT branchno, street, city, postcode FROM dh_branch' // Explicitly select the relevant columns
    const result = await executeQuery(query)

    const columnNames = ['branch_no', 'street', 'city', 'postal_code']

    const jsonResult = result.rows.map((row) => {
      return {
        branch_no: row[0], // Maps branchno -> branch_no
        street: row[1], // Maps street -> street
        city: row[2], // Maps city -> city
        postal_code: row[3], // Maps postcode -> postal_code
      }
    })

    res.json(jsonResult) // Sends the branch data as JSON
  } catch (err) {
    console.error('Error retrieving branch data:', err.message) // Log the error
    res.status(500).send('Error retrieving branch data')
  }
})

app.get('/branch/:branchNo', async (req, res) => {
  const { branchNo } = req.params // Extract branchNo from the request URL

  // Updated query to fetch all the branch details
  const checkBranchQuery = `SELECT branchno, street, city, postcode FROM dh_branch WHERE branchno = :branchNo`

  try {
    // Execute the query with the provided branchNo
    const result = await executeQuery(checkBranchQuery, { branchNo })

    if (result.rows.length > 0) {
      // If the branch exists, return a success response with all branch details
      const [branch] = result.rows // Destructure the first row

      res.status(200).json({
        exists: true,
        branch: {
          branch_no: branch[0], // Map to frontend naming: branch_no
          street: branch[1], // street
          city: branch[2], // city
          postal_code: branch[3], // Map to frontend naming: postal_code
        },
      })
    } else {
      // If no matching branch is found, return a not-found response
      res.status(404).json({
        exists: false,
        message: 'Branch not found',
      })
    }
  } catch (error) {
    console.error('Error fetching branch:', error.message)

    // Return an internal server error if the query fails
    res.status(500).json({
      error: 'Internal Server Error',
      details: error.message,
    })
  }
})

app.post('/branch', async (req, res) => {
  const {
    branch_no, // Use branch_no to match the frontend and database naming
    street,
    city,
    postal_code, // Use postal_code to match the frontend and database naming
  } = req.body

  // Validate input
  if (!branch_no || !street || !city || !postal_code) {
    return res.status(400).json({ message: 'All fields are required' })
  }

  // Map frontend keys to database fields
  const newBranch = {
    branchno: branch_no, // Map branch_no to branchno for Oracle
    street: street,
    city: city,
    postcode: postal_code, // Map postal_code to postcode for Oracle
  }

  try {
    // Check if branch already exists
    const checkBranchQuery = `SELECT branchno FROM dh_branch WHERE branchno = :branchno`
    const existingBranch = await executeQuery(checkBranchQuery, {
      branchno: branch_no,
    })

    if (existingBranch && existingBranch.length > 0) {
      return res.status(409).json({ message: 'The branch already exists.' })
    }

    // SQL query to insert a new branch
    const insertBranchQuery = `
      INSERT INTO dh_branch (
        branchno,
        street,
        city,
        postcode
      ) VALUES (
        :branchno,
        :street,
        :city,
        :postcode
      )
    `

    // Execute the query to insert the branch
    await executeQuery(insertBranchQuery, newBranch)

    res.status(201).json({
      message: 'New branch created successfully.',
      branch: newBranch,
    })
  } catch (err) {
    console.error('Error creating branch:', err)

    if (err.message.includes('unique constraint')) {
      return res.status(409).json({ message: 'Branch already exists.' })
    }

    res
      .status(500)
      .json({ message: 'Internal Server Error', error: err.message })
  }
})

app.put('/branch', async (req, res) => {
  // Link the item to backend
  // branchNo -- used in frontend
  const { branchNo: branchno, street, city, postcode } = req.body

  // Ensure branch number is provided
  if (!branchno) {
    return res.status(400).send('Branch numbçr is required')
  }

  try {
    // Query to check if the branch exists in the database
    const checkBranchQuery = `SELECT branchno FROM dh_branch WHERE branchno = :branchno`
    console.log(`Executing check query: ${checkBranchQuery}`)
    const checkResult = await executeQuery(checkBranchQuery, { branchno })

    // If the branch doesn't exist, return a 404 error
    if (checkResult.length === 0) {
      return res.status(404).send(`Branch number ${branchno} not found`)
    }

    // Log current values in the database before performing the update
    const checkCurrentValuesQuery = `SELECT street, city, postcode FROM dh_branch WHERE branchno = :branchno`
    console.log(`Executing current values query: ${checkCurrentValuesQuery}`)
    const currentValuesResult = await executeQuery(checkCurrentValuesQuery, {
      branchno,
    })
    console.log('Current values in database:', currentValuesResult)

    // Log the values being passed for update
    console.log('Current values to update:', {
      branchno,
      street,
      city,
      postcode,
    })

    // Query to update the branch data with safe conditional updates
    const updateQuery = `
      UPDATE dh_branch
      SET
        street = COALESCE(NULLIF(:p_street, street), street),
        city = COALESCE(NULLIF(:p_city, city), city),
        postcode = COALESCE(NULLIF(:p_postcode, postcode), postcode)
      WHERE branchno = :p_branchno
    `
    console.log(`Executing update query: ${updateQuery}`)

    // Pass the parameters for the update
    const updateResult = await executeQuery(updateQuery, {
      p_street: street,
      p_city: city,
      p_postcode: postcode,
      p_branchno: branchno,
    })

    // Log the result of the update
    console.log('Update Result:', updateResult)

    // Check if the update affected any rows
    if (updateResult.rowsAffected > 0) {
      return res.status(200).send('Branch updated successfully')
    } else {
      return res.status(500).send('Error updating branch')
    }
  } catch (err) {
    console.error('Error updating branch:', err)
    return res.status(500).send('Database error')
  }
})

// GET method to retrieve all client records
app.get('/client', async (req, res) => {
  try {
    const query =
      'SELECT clientno, fname, lname, telno, email, preftype, maxrent FROM dh_client' // Ensure table name is correct
    const result = await executeQuery(query)

    const columnNames = [
      'client_id',
      'first_name',
      'last_name',
      'telephone',
      'email',
      'prefer_type',
      'max_rent',
    ]

    const jsonResult = result.rows.map((row) => {
      return columnNames.reduce((obj, col, index) => {
        obj[col] = row[index]
        return obj
      }, {})
    })

    res.json(jsonResult) // Sends the client data as JSON
  } catch (err) {
    console.error('Error retrieving client data:', err) // Log error details
    res.status(500).send('Error retrieving client data')
  }
})

app.put('/client', async (req, res) => {
  const { clientno, fname, lname, telno, email, preftype, maxrent } = req.body

  // Validate that clientno is provided
  if (!clientno) {
    return res.status(400).send('Client ID is required')
  }

  try {
    // Query to check if the client exists in the database
    const checkClientQuery = `SELECT clientno FROM dh_client WHERE clientno = :p_clientNo`

    // Execute the query to check if the client exists
    const checkResult = await executeQuery(checkClientQuery, {
      p_clientNo: clientno,
    })

    // If no client is found
    if (checkResult.length === 0) {
      return res.status(404).send(`Client ID ${clientno} not found`)
    }

    // Query to update client information (fixed: removed BEGIN/END block)
    // Remove update name to avoid null value
    const updateQuery = `
      UPDATE dh_client
      SET
        telno = :p_telno,
        email = :p_email,
        preftype = :p_preftype,
        maxrent = :p_maxrent
      WHERE clientno = :p_clientno
    `

    const binds = {
      p_clientno: clientno,
      p_fname: fname || '', // Use empty string if no first_name is provided
      p_lname: lname || '',
      p_telno: telno || '',
      p_email: email || '',
      p_preftype: preftype || '',
      p_maxrent: maxrent || null, // Use null if no max_rent is provided
    }

    // Log query and binds for debugging
    console.log('Executing query:', updateQuery)
    console.log('With binds:', binds)

    // Execute the query to update the client in the database
    await executeQuery(updateQuery, binds)

    // Return a success message
    res.status(200).send('Client information updated successfully')
  } catch (err) {
    console.error('Error updating client information:', err.message || err)
    res.status(500).send('Error updating client information')
  }
})

app.post('/client', async (req, res) => {
  const {
    clientNo, // Client number (required)
    fname, // First name
    lname, // Last name
    telno, // Telephone number
    street, // Street address
    city, // City
    email, // Email address
    preftype, // Preferred type (e.g., House or Flat)
    maxrent, // Maximum rent
  } = req.body

  // Validate input
  if (!clientNo) {
    return res
      .status(400)
      .send('Client number is required to identify the client')
  }

  // Prepare the client data to be inserted
  const newClient = {
    clientno: clientNo,
    fname,
    lname,
    telno,
    street,
    city,
    email,
    preftype,
    maxrent,
  }

  try {
    // SQL query to insert a new client into the dh_client table
    const query = `
      INSERT INTO dh_client (clientno, fname, lname, telno, street, city, email, preftype, maxrent)
      VALUES (:clientno, :fname, :lname, :telno, :street, :city, :email, :preftype, :maxrent)
    `

    // Bind the values to the placeholders in the SQL query
    const binds = {
      clientno: clientNo,
      fname: fname,
      lname: lname,
      telno: telno || null, // If telno is missing, send null
      street: street || null, // If street is missing, send null
      city: city || null, // If city is missing, send null
      email: email || null, // If email is missing, send null
      preftype: preftype || null, // If preftype is missing, send null
      maxrent: maxrent || null, // If maxrent is missing, send null
    }

    // Execute the query to insert the new client
    await executeQuery(query, binds)

    // Return success message
    res.status(201).json({
      message: 'Client inserted successfully into dh_client',
      client: newClient,
    })
  } catch (err) {
    console.error('Error inserting client:', err)
    res.status(500).send(`Error inserting client: ${err.message}`)
  }
})

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
  populateStaffHashMap() // Populate the hash-map at startup
})
