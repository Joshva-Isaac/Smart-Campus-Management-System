/**********************************************
 * SMART CAMPUS MANAGEMENT SYSTEM - app.js
 * Handles login, admin updates, faculty actions,
 * and student views (results, attendance, announcements)
 **********************************************/

// ---------------- LOGIN SYSTEM ----------------
document.getElementById("loginForm")?.addEventListener("submit", function(e) {
  e.preventDefault();
  const role = document.getElementById("role").value;
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  // Set passwords for each role
  const credentials = {
    admin:    { username: "admin",    password: "admin123" },
    faculty:  { username: "faculty",  password: "fac123" },
    student:  { username: "192421085", password: "std123" } // Example student
  };

  if (role === "admin") {
    if (username === credentials.admin.username && password === credentials.admin.password) {
      window.location.href = "admin/admin-dashboard.html";
    } else {
      alert("Invalid admin credentials!");
    }
  } else if (role === "faculty") {
    if (username === credentials.faculty.username && password === credentials.faculty.password) {
      window.location.href = "faculty/faculty-dashboard.html";
    } else {
      alert("Invalid faculty credentials!");
    }
  } else if (role === "student") {
    if (username === credentials.student.username && password === credentials.student.password) {
      window.location.href = "student/student-dashboard.html";
    } else {
      alert("Invalid student credentials!");
    }
  } else {
    alert("Please select a role!");
  }
});

// ---------------- MOCK DATABASE ----------------
let db = {
  students: [
    { id: "192421085", name: "joshva", course: "IT", attendance: 90, results: [] },
    { id: "192421275", name: "naren swamy", course: "IT", attendance: 85, results: [] }
  ],
  faculty: [
    { id: "F001", name: "Dr. John", subject: "Programming", hours: 20 }
  ],
  announcements: []
};

// Load from localStorage if available
if (localStorage.getItem("db")) {
  db = JSON.parse(localStorage.getItem("db"));
}

// Save DB to localStorage
function saveDB() {
  localStorage.setItem("db", JSON.stringify(db));
}

// ---------------- ADMIN FUNCTIONS ----------------

// Upload Results
document.getElementById("resultForm")?.addEventListener("submit", function(e) {
  e.preventDefault();
  const studentId = document.getElementById("studentId").value;
  const courseCode = document.getElementById("courseCode").value;
  const marks = parseInt(document.getElementById("marks").value);
  const grade = document.getElementById("grade").value;

  let student = db.students.find(s => s.id === studentId);
  if (student) {
    student.results.push({ code: courseCode, marks, grade });
    saveDB();
    alert("✅ Result uploaded successfully!");
    this.reset();
  } else {
    alert("❌ Student not found!");
  }
});

// Post Announcements
document.getElementById("announcementForm")?.addEventListener("submit", function(e) {
  e.preventDefault();
  const text = document.getElementById("announcementText").value;
  db.announcements.push({ text, date: new Date().toLocaleString() });
  saveDB();
  renderAnnouncements();
  this.reset();
});

// Render Announcements
function renderAnnouncements() {
  const ul = document.getElementById("announcements");
  if (ul) {
    ul.innerHTML = "";
    db.announcements.forEach(a => {
      let li = document.createElement("li");
      li.textContent = `${a.date} - ${a.text}`;
      ul.appendChild(li);
    });
  }
}
renderAnnouncements();

// ---------------- FACULTY FUNCTIONS ----------------
// Mark Attendance
document.getElementById("attendanceForm")?.addEventListener("submit", function(e) {
  e.preventDefault();
  const studentId = document.getElementById("studentId").value;
  const attendanceValue = parseInt(document.getElementById("attendanceValue").value, 10);

  let db = JSON.parse(localStorage.getItem("db")) || {};
  let student = db.students.find(s => s.id === studentId);
  if (student) {
    student.attendance = attendanceValue;
    localStorage.setItem("db", JSON.stringify(db)); // Triggers real-time update in student page
    alert("Attendance updated for " + studentId);
  } else {
    alert("Student not found!");
  }
});

// ---------------- STUDENT FUNCTIONS ----------------
// Show Results
function loadStudentResults(studentId) {
  const student = db.students.find(s => s.id === studentId);
  const tbody = document.querySelector("#resultsTable tbody");
  if (student && tbody) {
    tbody.innerHTML = "";
    student.results.forEach(r => {
      let tr = document.createElement("tr");
      tr.innerHTML = `<td>${r.code}</td><td>${r.marks}</td><td>${r.grade}</td>`;
      tbody.appendChild(tr);
    });
  }
}

// Show Attendance
function loadStudentAttendance(studentId) {
  // Always get the latest DB from localStorage
  let latestDB = JSON.parse(localStorage.getItem("db")) || db;
  const student = latestDB.students.find(s => s.id === studentId);
  const attDiv = document.getElementById("attendancePercent");
  if (student && attDiv) {
    attDiv.textContent = `${student.attendance}%`;
  }
}

// Show Announcements
function loadStudentAnnouncements() {
  const ul = document.getElementById("studentAnnouncements");
  if (ul) {
    ul.innerHTML = "";
    db.announcements.forEach(a => {
      let li = document.createElement("li");
      li.textContent = `${a.date} - ${a.text}`;
      ul.appendChild(li);
    });
  }
}
loadStudentAnnouncements();

/* =======================
   COURSE ENROLLMENT LOGIC
   ======================= */

// Faculty opens a course for a slot
function saveCourseOpening(e) {
  e.preventDefault();
  let slot = document.getElementById("slot").value;
  let subject = document.getElementById("subject").value;

  let courses = JSON.parse(localStorage.getItem("openCourses")) || {};
  if (!courses[slot]) courses[slot] = [];
  courses[slot].push(subject);

  localStorage.setItem("openCourses", JSON.stringify(courses));
  loadOpenCourses();
  e.target.reset();
}

function loadOpenCourses() {
  let courses = JSON.parse(localStorage.getItem("openCourses")) || {};
  let list = document.getElementById("openCourses");
  if (!list) return;
  list.innerHTML = "";
  for (let slot in courses) {
    courses[slot].forEach(subject => {
      let li = document.createElement("li");
      li.textContent = `${slot}: ${subject}`;
      list.appendChild(li);
    });
  }
}

// Student loads course options into enrollment form
function loadEnrollmentForm() {
  let courses = JSON.parse(localStorage.getItem("openCourses")) || {};
  ["A","B","C","D"].forEach(slot => {
    let select = document.getElementById("slot" + slot);
    if (select) {
      select.innerHTML = "";
      if (courses[slot] && courses[slot].length > 0) {
        courses[slot].forEach(subj => {
          let opt = document.createElement("option");
          opt.value = subj;
          opt.textContent = subj;
          select.appendChild(opt);
        });
      } else {
        let opt = document.createElement("option");
        opt.value = "";
        opt.textContent = "No courses opened";
        select.appendChild(opt);
      }
    }
  });
  loadStudentEnrollment();
}

// Save student enrollment request
function saveStudentEnrollment(e) {
  e.preventDefault();
  let enrollment = {
    slotA: document.getElementById("slotA").value,
    slotB: document.getElementById("slotB").value,
    slotC: document.getElementById("slotC").value,
    slotD: document.getElementById("slotD").value
  };
  localStorage.setItem("studentEnrollment", JSON.stringify(enrollment));
  loadStudentEnrollment();
}

// Display student enrollment
function loadStudentEnrollment() {
  let enrollment = JSON.parse(localStorage.getItem("studentEnrollment")) || {};
  let list = document.getElementById("studentEnrollment");
  if (!list) return;
  list.innerHTML = "";
  for (let slot in enrollment) {
    let li = document.createElement("li");
    li.textContent = `${slot}: ${enrollment[slot] || "Not selected"}`;
    list.appendChild(li);
  }
}
loadOpenCourses();
loadEnrollmentForm();

function markAttendance(studentId, subject, status) {
  let db = JSON.parse(localStorage.getItem("db")) || {students: []};
  let student = db.students.find(s => s.id === studentId);
  if (!student) return;
  if (!student.attendance) student.attendance = {};
  if (typeof student.attendance[subject] !== "number") student.attendance[subject] = 100;
  if (status === "present") {
    student.attendance[subject] = Math.min(100, student.attendance[subject] + 10);
  } else if (status === "absent") {
    student.attendance[subject] = Math.max(0, student.attendance[subject] - 10);
  }
  localStorage.setItem("db", JSON.stringify(db));
}

function renderAttendanceTable() {
  let db = JSON.parse(localStorage.getItem("db")) || {students: []};
  let tbody = document.getElementById("attendanceTableBody");
  tbody.innerHTML = "";
  db.students.forEach(s => {
    let attendanceDetails = "";
    if (s.attendance) {
      for (const [subject, percent] of Object.entries(s.attendance)) {
        attendanceDetails += `<div>${subject}: ${percent}%</div>`;
      }
    }
    let row = `<tr>
      <td>${s.id}</td>
      <td>${s.name}</td>
      <td>${attendanceDetails || "No data"}</td>
    </tr>`;
    tbody.innerHTML += row;
  });
}
renderAttendanceTable();

window.addEventListener("storage", function(event) {
  if (event.key === "db") renderAttendanceTable();
});
// Path to student data (simulate database)
const dataPath = "../data/data.json";

// Faculty Attendance Form Handling
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("attendanceForm");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const studentId = document.getElementById("studentId").value;
      const status = document.getElementById("status").value;
      const today = new Date().toISOString().split("T")[0];

      // Load existing data.json
      let response = await fetch(dataPath);
      let data = await response.json();

      // Find student and update attendance
      let student = data.students.find(s => s.id === studentId);
      if (student) {
        student.attendance.push({ date: today, status: status });

        // Save back to JSON (simulation only – real system needs server API)
        localStorage.setItem("studentData", JSON.stringify(data));
        alert(`Attendance marked for ${student.name} on ${today}`);
      } else {
        alert("Student not found!");
      }
    });
  }

  // Student Attendance Page Loader
  const table = document.getElementById("attendanceTable");
  if (table) {
    let storedData = localStorage.getItem("studentData");
    if (storedData) {
      let data = JSON.parse(storedData);
      let tbody = table.querySelector("tbody");
      tbody.innerHTML = "";

      data.students.forEach(student => {
        student.attendance.forEach(record => {
          let row = `<tr>
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td>${student.department}</td>
            <td>${record.date}</td>
            <td>${record.status}</td>
          </tr>`;
          tbody.innerHTML += row;
        });
      });
    }
  }
});
