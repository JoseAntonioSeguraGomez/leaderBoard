export function functionStart() {
    // VARIABLES DE CONFIGURACION DE LA API
    const url = "https://academy.turiscool.com/admin/api/"
    const token = "Bearer 17xa7adwlycG4qrbRatBdCHW41xtl9jNyaBq4d45";
    const lwId = "62b182eea31d8d9863079f42";
    //esta variable hay que cambiarlo por el id del usuario conectado, que se recoge un elemento de la página
    //let userId = "65d3763f741db932c906da1c";

    const requestOptions = {
    method: "GET",
    headers: {
        Authorization: token,
        "Content-Type": "application/json",
        "Lw-Client": lwId,
    },
    };

    // tag que se le pas para filtrar por marca
    let tag = "MM-ADONIS";
    let redirect = "after-login-b2b-adonis"
    let pages = 0;
    let user = {};
    let users = [];
    let usersByTag = [];
    let filteredUsers = [];
    let theLastUser = {};
    let theRecientUser = {};
    let progress = [];
    let progressFiltered = {
    totalCourses: 0,
    coursesStarted: 0,
    completedCourses: 0,
    courseProgress: 0,
    averageTotalCourseProgress: 0,
    totalTime: 0,
    lastCourse: 0,
    dateLastCourse: 0,
    lastSection: 0,
    };

    let courses = [];
    let longCourse = {
    name: "",
    time: 0,
    };
    let shortCourse = {
    name: "",
    time: 100000000,
    };
    let courseAbandoned = {
    name: "",
    count: 0,
    };
    let coursePopular = {
    name: "",
    count: 0,
    };
    let lowerCourseAverage = {
    name: "",
    average: 100000,
    };
    let highestCourseAverage = {
    name: "",
    average: 0,
    };
    let lastUserConected = {
    name: "",
    time: 0,
    };
    let userConected = {
    name: "",
    time: 1000000000,
    };

    function redirectButton() {
    window.location.href = `https://academy.turiscool.com/${redirect}`;
    }

    /////////////////////////// INICIO ///////////////////////////
    // LLAMADA A LAS FUNCIONES UNA VEZ CARGADA LA PAGINA //
    function functionStart() {
    // OBTENER EL ID DEL USUARIO CONECTADO
    userId = document.getElementById('el_1712750078537_354').textContent;
    fetchMetaProgress();
    fetchUser();
    }



    /////////////////////////// FUNCIONES DE RECOPILACION DE DATOS ///////////////////////////
    function fetchMetaProgress() {
    fetch(`${url}/v2/users/${userId}/progress?items_per_page=200`, requestOptions)
        .then(response => response.json())
        .then(metaData => {
        console.log(metaData);
        pages = metaData.meta.totalPages;
        fetchData();
        fetchMeta();
        });
    }

    function fetchMeta() {
    delay(1000).then(() => {
        fetch(`${url}/v2/users?items_per_page=200`, requestOptions)
        .then(response => response.json())
        .then(metaData => {
            pages = metaData.meta.totalPages;
            fetchAlumn();
        })
    });
    }

    function fetchData() {
    let fetchPromises = [];

    for (let i = 1; i <= pages; i++) {
        fetchPromises.push(
        fetch(`${url}/v2/users/${userId}/progress?page=${i}&items_per_page=200`, requestOptions)
            .then(response => response.json())
            .then(progressData => {
            for (let i = 0; i < progressData.data.length; i++) {
                progress.push(progressData.data[i]);
            }
            })
        );
    }

    Promise.all(fetchPromises)
        .then(() => {
        filterProgressUser();
        });
    }

    function fetchUser() {
    fetch(`${url}/v2/users/${userId}`, requestOptions)
        .then(response => response.json())
        .then(userData => {
        console.log(userData);
        user = {
            name: userData.username.toUpperCase(),
            email: userData.email,
            role: userData.role,
            createDate: userData.created,
            tags: userData.tags,
            phoneNumber: userData.fields.phone,
            address: userData.fields.address,
            country: userData.fields.country,
            company: userData.fields.company,
            birthday: userData.fields.birthday,
            nps: userData.nps_score,
            lastLogin: userData.last_login
        }
        showUserInfo();
        })
    }

    function fetchAlumn() {
    let fetchPromises = [];
    delay(1000).then(() => {
        for (let i = 0; i < pages; i++) {
        fetchPromises.push(
            fetch(`${url}/v2/users?items_per_page=200&page=${i}`, requestOptions)
            .then(response => response.json())
            .then(data => {
                for (let j = 0; j < data.data.length; j++) {
                let userObject = {
                    name: data.data[j].username.toUpperCase(),
                    tags: data.data[j].tags,
                    id: data.data[j].id,
                    nps: data.data[j].nps_score,
                    lastLogin: data.data[j].last_login,
                };

                users.push(userObject);
                }
            })
        );

        }

        Promise.allSettled(fetchPromises)
        .then(() => {
            console.log(users);
            searchUser();
        });
    });
    }

    function fetchProgress() {
    let fetchPromises = [];

    delay(1000).then(() => {
        for (let i = 0; i < usersByTag.length; i++) {
        fetchPromises.push(
            fetch(`${url}/v2/users/${usersByTag[i].id}/progress`, requestOptions)
            .then(response => response.json())
            .then(progressData => {
                progressData.name = usersByTag[i].name;
                progressData.userID = usersByTag[i].id;
                progressData.nps = usersByTag[i].nps;
                progressData.lastLogin = usersByTag[i].lastLogin;
                filteredUsers.push(progressData);
            })
        );
        }


        Promise.allSettled(fetchPromises)
        .then(() => {
            console.log(filteredUsers);
            filterProgress();
        });
    });
    }

    /////////////////////////// FUNCIONES DE FILTRADO DE DATOS ///////////////////////////
    function searchUser() {
    users.filter(user => {
        if (user.tags.includes(tag)) {
        usersByTag.push(user);
        }
    });
    fetchProgress();
    }

    function showTop10() {
    let topUsers = [];
    for (let i = 0; i < filteredUsers.length; i++) {
        let totalScore = 0;
        for (let j = 0; j < filteredUsers[i].data.length; j++) {
        totalScore += filteredUsers[i].data[j].average_score_rate;
        }
        let averageScore = totalScore / filteredUsers[i].data.length;
        averageScore = Math.trunc(averageScore * 10);
        topUsers.push({ name: filteredUsers[i].name, total: averageScore })
    }
    topUsers.sort((a, b) => b.total - a.total);
    return topUsers;
    }


    // OBTENER DATOS FILTRADOS DEL USUARIO ACTUAL
    function filterProgress() {
    for (let i = 0; i < filteredUsers.length; i++) {
        console.log(filteredUsers[i].userID, user.id)
        if (filteredUsers[i].userID === user.id) {
        user = filteredUsers[i];
        }
    }
    showTopUsers();
    showTopUsers3();
    showUserMe();
    showCourseInfo()
    filterCourses();
    showMoreCourseInfo();
    showInfoUser();
    }

    // RECOGER DATOS GENERALES DE LOS CURSOS
    function courseInfo() {
    let coursesData = {
        totalCoursesCompleted: 0,
        totalTime: 0,
        averageScore: 0,
        totalNPS: 0,
        totalUnits: 0,
        countCurses: 0,
    };

    let coursesTotal = 0;
    for (let i = 0; i < filteredUsers.length; i++) {
        coursesData.totalNPS += filteredUsers[i].nps;
        coursesTotal += filteredUsers[i].data.length;

        filteredUsers[i].data.forEach(course => {
        let lessonComplete = true;

        if (course.progress_rate === 100) {
            coursesData.totalCoursesCompleted += 1;
        }
        coursesData.totalTime += course.time_on_course;
        if (course.progress_rate === 100) {
            coursesData.averageScore += course.average_score_rate / 10;
            coursesData.countCurses += 1;
        }
        coursesData.totalUnits += course.completed_units;
        });
    }

    coursesData.averageScore = coursesData.averageScore / coursesTotal;
    coursesData.averageScore = Math.round((coursesData.averageScore / coursesData.countCurses) * 100);
    console.log(coursesData.averageScore);
    coursesData.totalNPS = coursesData.totalNPS / filteredUsers.length;
    return coursesData;
    }

    // MOSTRAR LOS DATOS DE LOS CURSOS
    function filterCourses() {
    let totalScores = 0;
    let totalCourses = 0;
    let arrayCoursesAbandoned = [];
    let arrayCoursesPopular = [];

    for (let i = 0; i < filteredUsers.length; i++) {
        if (filteredUsers[i].lastLogin > lastUserConected.time) {
        lastUserConected.name = filteredUsers[i].name;
        lastUserConected.time = filteredUsers[i].lastLogin;
        }
        if (filteredUsers[i].lastLogin === 0 || filteredUsers[i].lastLogin === null) {
        console.log("Usuario valor Invalido");
        } else {
        if (filteredUsers[i].lastLogin < userConected.time) {
            userConected.name = filteredUsers[i].name;
            userConected.time = filteredUsers[i].lastLogin;
        }
        }

        for (let j = 0; j < filteredUsers[i].data.length; j++) {
        let course = filteredUsers[i].data[j];
        let courseExists = false;
        for (let k = 0; k < courses.length; k++) {
            if (courses[k].name === course.course_id) {
            courseExists = true;
            courses[k].time += course.time_on_course;
            courses[k].progress_rate += course.progress_rate;
            courses[k].average += course.average_score_rate;
            courses[k].count += 1;
            break;
            if (course.progress_rate === 0) {
                for (let l = 0; l < arrayCoursesAbandoned.length; l++) {
                if (arrayCoursesAbandoned[l].name === course.course_id) {
                    arrayCoursesAbandoned[l].count += 1;
                    break;
                }
                }
            } else if (course.progress_rate > 0) {
                for (let l = 0; l < arrayCoursesPopular.length; l++) {
                if (arrayCoursesPopular[l].name === course.course_id) {
                    arrayCoursesPopular[l].count += 1;
                    break;
                }
                }
            }
            }
        }

        if (!courseExists) {
            courses.push({
            name: course.course_id,
            time: course.time_on_course,
            progress_rate: course.progress_rate,
            average: course.average_score_rate,
            count: 1,
            });
            if (course.progress_rate === 0) {
            arrayCoursesAbandoned.push({
                name: course.course_id,
                count: 1,
            });
            } else if (course.progress_rate > 0) {
            arrayCoursesPopular.push({
                name: course.course_id,
                count: 1,
            });
            }
        }
        }
    }

    console.log(courses);

    for (let i = 0; i < courses.length; i++) {
        if (courses[i].time > longCourse.time) {
        longCourse.name = courses[i].name;
        longCourse.time = courses[i].time;
        }

        if (courses[i].time < shortCourse.time) {
        shortCourse.name = courses[i].name;
        shortCourse.time = courses[i].time;
        }

        if (courses[i].average / courses[i].count < lowerCourseAverage.average) {
        lowerCourseAverage.name = courses[i].name;
        lowerCourseAverage.average = courses[i].average / courses[i].count;
        }

        if (courses[i].average / courses[i].count > highestCourseAverage.average) {
        highestCourseAverage.name = courses[i].name;
        highestCourseAverage.average = courses[i].average / courses[i].count;
        }
    }

    for (let i = 0; i < arrayCoursesAbandoned.length; i++) {
        if (arrayCoursesAbandoned[i].count > courseAbandoned.count) {
        courseAbandoned.name = arrayCoursesAbandoned[i].name;
        courseAbandoned.count = arrayCoursesAbandoned[i].count;
        }
    }

    for (let i = 0; i < arrayCoursesPopular.length; i++) {
        if (arrayCoursesPopular[i].count > coursePopular.count) {
        coursePopular.name = arrayCoursesPopular[i].name;
        coursePopular.count = arrayCoursesPopular[i].count;
        }
    }

    }

    function showDate(time) {
    const date = new Date(time * 1000);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const minutes = date.getMinutes();
    const hours = date.getHours();

    let monthName = "";
    let monthNames = [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre",
    ];

    // RECORRER EL ARRAY DE LOS MESES Y ASIGNAR EL NOMBRE DEL MES
    for (let i = 0; i < monthNames.length; i++) {
        if (month === i + 1) {
        monthName = monthNames[i];
        }
    }
    let finalDate = "";
    if (hours > 12) {
        finalDate = `${day} de ${monthName} de ${year}, ${hours}:${minutes} PM`;
    } else {
        finalDate = `${day} de ${monthName} de ${year}, ${hours}:${minutes} AM`;
    }
    return finalDate;
    }

    /////////////////////////// FUNCIONES DE VISUALIZACION DE DATOS ///////////////////////////

    function showUserInfo() {
    let username = document.getElementById('username');
    let age = document.getElementById('age');
    let email = document.getElementById('email');
    let div = document.createElement('p');
    let profileCard = document.querySelector('.profile-card');

    username.innerHTML = `<svg viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#FFFFFF"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>profile [#1336]</title> <desc>Created with Sketch.</desc> <defs> </defs> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="Dribbble-Light-Preview" transform="translate(-380.000000, -2159.000000)" fill="#000000"> <g id="icons" transform="translate(56.000000, 160.000000)"> <path d="M334,2011 C337.785,2011 340.958,2013.214 341.784,2017 L326.216,2017 C327.042,2013.214 330.215,2011 334,2011 M330,2005 C330,2002.794 331.794,2001 334,2001 C336.206,2001 338,2002.794 338,2005 C338,2007.206 336.206,2009 334,2009 C331.794,2009 330,2007.206 330,2005 M337.758,2009.673 C339.124,2008.574 340,2006.89 340,2005 C340,2001.686 337.314,1999 334,1999 C330.686,1999 328,2001.686 328,2005 C328,2006.89 328.876,2008.574 330.242,2009.673 C326.583,2011.048 324,2014.445 324,2019 L344,2019 C344,2014.445 341.417,2011.048 337.758,2009.673" id="profile-[#1336]"> </path> </g> </g> </g> </g></svg>
        ${showUndefined(user.name)}`;
    age.innerHTML = `<svg viewBox="0 -2.19 47.336 47.336" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g id="Group_40" data-name="Group 40" transform="translate(-66.66 -364.396)"> <path id="Rectangle_15" data-name="Rectangle 15" d="M4.351,0H40.984a4.351,4.351,0,0,1,4.351,4.351V22.117a1,1,0,0,1-1,1H1a1,1,0,0,1-1-1V4.351A4.351,4.351,0,0,1,4.351,0Z" transform="translate(67.66 383.243)" fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path> <path id="Path_88" data-name="Path 88" d="M113,389.249a3.778,3.778,0,0,1-3.778,3.778h0a3.779,3.779,0,0,1-3.778-3.778,3.778,3.778,0,0,1-3.778,3.778h0a3.779,3.779,0,0,1-3.778-3.778,3.778,3.778,0,0,1-3.778,3.778h0a3.779,3.779,0,0,1-3.778-3.778,3.778,3.778,0,0,1-3.778,3.778h0a3.779,3.779,0,0,1-3.778-3.778,3.778,3.778,0,0,1-3.778,3.778h0a3.778,3.778,0,0,1-3.777-3.778,3.779,3.779,0,0,1-3.778,3.778h0a3.778,3.778,0,0,1-3.778-3.778" fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path> <g id="Group_39" data-name="Group 39"> <rect id="Rectangle_16" data-name="Rectangle 16" width="4.333" height="9.73" transform="translate(87.931 373.513)" fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></rect> <path id="Path_89" data-name="Path 89" d="M92.825,370.333a2.727,2.727,0,1,1-5.455,0c0-1.506,2.727-4.937,2.727-4.937S92.825,368.827,92.825,370.333Z" fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path> </g> </g> </g></svg>
        ${showUndefined(user.birthday)} `;
    email.innerHTML = `<svg height="200px" width="200px" version="1.1" id="_x32_" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <style type="text/css"> .st0{fill:#000000;} </style> <g> <path class="st0" d="M510.746,110.361c-2.128-10.754-6.926-20.918-13.926-29.463c-1.422-1.794-2.909-3.39-4.535-5.009 c-12.454-12.52-29.778-19.701-47.531-19.701H67.244c-17.951,0-34.834,7-47.539,19.708c-1.608,1.604-3.099,3.216-4.575,5.067 c-6.97,8.509-11.747,18.659-13.824,29.428C0.438,114.62,0,119.002,0,123.435v265.137c0,9.224,1.874,18.206,5.589,26.745 c3.215,7.583,8.093,14.772,14.112,20.788c1.516,1.509,3.022,2.901,4.63,4.258c12.034,9.966,27.272,15.45,42.913,15.45h377.51 c15.742,0,30.965-5.505,42.967-15.56c1.604-1.298,3.091-2.661,4.578-4.148c5.818-5.812,10.442-12.49,13.766-19.854l0.438-1.05 c3.646-8.377,5.497-17.33,5.497-26.628V123.435C512,119.06,511.578,114.649,510.746,110.361z M34.823,99.104 c0.951-1.392,2.165-2.821,3.714-4.382c7.689-7.685,17.886-11.914,28.706-11.914h377.51c10.915,0,21.115,4.236,28.719,11.929 c1.313,1.327,2.567,2.8,3.661,4.272l2.887,3.88l-201.5,175.616c-6.212,5.446-14.21,8.443-22.523,8.443 c-8.231,0-16.222-2.99-22.508-8.436L32.19,102.939L34.823,99.104z M26.755,390.913c-0.109-0.722-0.134-1.524-0.134-2.341V128.925 l156.37,136.411L28.199,400.297L26.755,390.913z M464.899,423.84c-6.052,3.492-13.022,5.344-20.145,5.344H67.244 c-7.127,0-14.094-1.852-20.142-5.344l-6.328-3.668l159.936-139.379l17.528,15.246c10.514,9.128,23.922,14.16,37.761,14.16 c13.89,0,27.32-5.032,37.827-14.16l17.521-15.253L471.228,420.18L464.899,423.84z M485.372,388.572 c0,0.803-0.015,1.597-0.116,2.304l-1.386,9.472L329.012,265.409l156.36-136.418V388.572z"></path> </g> </g></svg>
        ${showUndefined(user.email)}`;

    div.innerHTML = `<p><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M21 5.5C21 14.0604 14.0604 21 5.5 21C5.11378 21 4.73086 20.9859 4.35172 20.9581C3.91662 20.9262 3.69906 20.9103 3.50103 20.7963C3.33701 20.7019 3.18146 20.5345 3.09925 20.364C3 20.1582 3 19.9181 3 19.438V16.6207C3 16.2169 3 16.015 3.06645 15.842C3.12515 15.6891 3.22049 15.553 3.3441 15.4456C3.48403 15.324 3.67376 15.255 4.05321 15.117L7.26005 13.9509C7.70153 13.7904 7.92227 13.7101 8.1317 13.7237C8.31637 13.7357 8.49408 13.7988 8.64506 13.9058C8.81628 14.0271 8.93713 14.2285 9.17882 14.6314L10 16C12.6499 14.7999 14.7981 12.6489 16 10L14.6314 9.17882C14.2285 8.93713 14.0271 8.81628 13.9058 8.64506C13.7988 8.49408 13.7357 8.31637 13.7237 8.1317C13.7101 7.92227 13.7904 7.70153 13.9509 7.26005L13.9509 7.26005L15.117 4.05321C15.255 3.67376 15.324 3.48403 15.4456 3.3441C15.553 3.22049 15.6891 3.12515 15.842 3.06645C16.015 3 16.2169 3 16.6207 3H19.438C19.9181 3 20.1582 3 20.364 3.09925C20.5345 3.18146 20.7019 3.33701 20.7963 3.50103C20.9103 3.69907 20.9262 3.91662 20.9581 4.35173C20.9859 4.73086 21 5.11378 21 5.5Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
            ${showUndefined(user.phoneNumber)}</p>
        <p><svg fill="#000000" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M30.216 9.318l-5.598-6c-0.19-0.203-0.454-0.317-0.732-0.317h-8.348l-0.031-2.063c0-0.517-0.448-0.938-1-0.938s-0.938 0.42-0.938 0.938l-0.030 2.063h-11.024c-0.552 0-1 0.447-1 1v12c0 0.552 0.448 1 1 1h11.011v14.063c0 0.517 0.448 0.938 1 0.938s1-0.42 1-0.938v-14.063h8.361c0.277 0 0.542-0.115 0.732-0.317l5.598-6c0.358-0.384 0.358-0.98 0-1.365zM23.452 15h-19.936v-10h19.936l4.665 5z"></path> </g></svg>
            ${showUndefined(user.address)}</p>
        <p><svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path clip-rule="evenodd" d="M10 7.88974C11.1046 7.88974 12 6.98912 12 5.87814C12 4.76716 11.1046 3.86654 10 3.86654C8.89543 3.86654 8 4.76716 8 5.87814C8 6.98912 8.89543 7.88974 10 7.88974ZM10 6.5822C10.3866 6.5822 10.7 6.26698 10.7 5.87814C10.7 5.4893 10.3866 5.17408 10 5.17408C9.6134 5.17408 9.3 5.4893 9.3 5.87814C9.3 6.26698 9.6134 6.5822 10 6.5822Z" fill="#000000" fill-rule="evenodd"></path><path clip-rule="evenodd" d="M5.15 5.62669C5.15 3.0203 7.37393 1 10 1C12.6261 1 14.85 3.0203 14.85 5.62669C14.85 6.06012 14.8114 6.53528 14.7269 7.03578L18 7.8588L25.7575 5.90818C26.0562 5.83306 26.3727 5.90057 26.6154 6.09117C26.8581 6.28178 27 6.57423 27 6.88395V23.9826C27 24.4441 26.6877 24.8464 26.2425 24.9584L18.2425 26.97C18.0833 27.01 17.9167 27.01 17.7575 26.97L10 25.0193L2.24254 26.97C1.94379 27.0451 1.6273 26.9776 1.38459 26.787C1.14187 26.5964 1 26.3039 1 25.9942V8.89555C1 8.43402 1.3123 8.03172 1.75746 7.91978L5.2731 7.03578C5.18863 6.53528 5.15 6.06012 5.15 5.62669ZM10 2.70986C8.20779 2.70986 6.85 4.06691 6.85 5.62669C6.85 7.21686 7.5125 9.57287 9.40979 11.3615C9.74241 11.6751 10.2576 11.6751 10.5902 11.3615C12.4875 9.57287 13.15 7.21686 13.15 5.62669C13.15 4.06691 11.7922 2.70986 10 2.70986ZM5.80904 8.97453L3.22684 9.62382C3.09349 9.65735 3 9.77726 3 9.91476V24.3212C3 24.5165 3.18371 24.6598 3.37316 24.6121L8.77316 23.2543C8.90651 23.2208 9 23.1009 9 22.9634V13.2506C7.40353 12.024 6.39235 10.4792 5.80904 8.97453ZM11 13.2506V22.9634C11 23.1009 11.0935 23.2208 11.2268 23.2543L16.6268 24.6121C16.8163 24.6598 17 24.5165 17 24.3212V9.91477C17 9.77726 16.9065 9.65735 16.7732 9.62382L14.191 8.97453C13.6076 10.4792 12.5965 12.024 11 13.2506ZM25 22.9634C25 23.1009 24.9065 23.2208 24.7732 23.2543L19.3732 24.6121C19.1837 24.6598 19 24.5165 19 24.3212V9.91477C19 9.77726 19.0935 9.65736 19.2268 9.62382L24.6268 8.26599C24.8163 8.21835 25 8.36159 25 8.55693V22.9634Z" fill="#000000" fill-rule="evenodd"></path></g></svg>
            ${showUndefined(user.country)} </p>
        <p><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <defs> <style>.cls-1,.cls-2{fill:none;stroke:#020202;stroke-miterlimit:10;stroke-width:1.91px;}.cls-1{stroke-linecap:square;}</style> </defs> <g id="briefcase_simple" data-name="briefcase simple"> <rect class="cls-1" x="1.5" y="6.27" width="21" height="15.27" rx="1.91"></rect> <path class="cls-2" d="M13.91,13h4.77A3.81,3.81,0,0,0,22.5,9.14v-1a1.91,1.91,0,0,0-1.91-1.91H3.41A1.91,1.91,0,0,0,1.5,8.18v1A3.81,3.81,0,0,0,5.32,13h8.59Z"></path> <line class="cls-1" x1="12" y1="12" x2="12" y2="13.91"></line> <polygon class="cls-1" points="15.82 6.27 8.18 6.27 9.14 2.46 14.86 2.46 15.82 6.27"></polygon> </g> </g></svg>
            ${showUndefined(user.company)} </p>
        <p><svg viewBox="-1 0 22 22" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>profile_plus [#1337]</title> <desc>Created with Sketch.</desc> <defs> </defs> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="Dribbble-Light-Preview" transform="translate(-340.000000, -2159.000000)" fill="#000000"> <g id="icons" transform="translate(56.000000, 160.000000)"> <path d="M298,2005 C298,2002.794 296.206,2001 294,2001 C291.794,2001 290,2002.794 290,2005 C290,2007.206 291.794,2009 294,2009 C296.206,2009 298,2007.206 298,2005 L298,2005 Z M304,2019 L299,2019 L299,2017 L301.784,2017 C300.958,2013.214 297.785,2011 294,2011 C290.215,2011 287.042,2013.214 286.216,2017 L289,2017 L289,2019 L284,2019 C284,2014.445 286.583,2011.048 290.242,2009.673 C288.876,2008.574 288,2006.89 288,2005 C288,2001.686 290.686,1999 294,1999 C297.314,1999 300,2001.686 300,2005 C300,2006.89 299.124,2008.574 297.758,2009.673 C301.417,2011.048 304,2014.445 304,2019 L304,2019 Z M295,2017 L297,2017 L297,2019 L295,2019 L295,2021 L293,2021 L293,2019 L291,2019 L291,2017 L293,2017 L293,2015 L295,2015 L295,2017 Z" id="profile_plus-[#1337]"> </path> </g> </g> </g> </g></svg>
            ${showDate(user.createDate)} </p>
        <p><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M12 7V12H15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
            ${showDate(user.lastLogin)}</p> 
        `;

    profileCard.appendChild(div);
    }

    function showProgressInfo() {
    let courses = document.getElementById('course-card-courses');
    let startCourses = document.getElementById('course-card-start-courses');
    let progressRate = document.getElementById('course-card-progress');
    let average = document.getElementById('course-card-average');
    let time = document.getElementById('course-card-time');
    let lastCourse = document.getElementById('course-card-last-course');
    let endCourse = document.getElementById('course-card-end-courses');

    courses.innerHTML = `${progressFiltered.totalCourses}`;
    startCourses.innerHTML = `${progressFiltered.coursesStarted}`;
    progressRate.value = `${progressFiltered.completedCourses}`;
    average.innerHTML = `${progressFiltered.averageTotalCourseProgress}`;
    time.innerHTML = `${progressFiltered.totalTime} minutos`;

    progressFiltered.lastCourse = progressFiltered.lastCourse.replace(/-/g, " ");

    lastCourse.innerHTML = `${progressFiltered.lastCourse} 
        <br><strong>Fecha:</strong> ${showDate(progressFiltered.dateLastCourse)}`;
    endCourse.innerHTML = `${progressFiltered.completedCourses}`;
    }

    function showTopUsers() {
    let datosRecibidos = false;
    let topUsers = showTop10();
    let row = document.getElementById("top10Users");
    let spiner = document.querySelector(".loader");

    for (let i = 0; i < 10; i++) {
        datosRecibidos = true;
        if (datosRecibidos) {
        spiner.style.display = 'none';
        }
        let fila = document.createElement("tr");
        fila.innerHTML = `<td>${i + 1}</td><td>${topUsers[i].name}</td><td>${topUsers[i].total}</td>`;
        row.appendChild(fila);
    }

    }

    function showTopUsers3() {
    let datosRecibidos = false;
    let spiner = document.querySelectorAll('.spinerVisible');
    let topUsers = showTop10();

    for (let i = 0; i < 3; i++) {
        let position = document.getElementById(`position${i + 1}`);
        datosRecibidos = true;
        if (datosRecibidos) {
        spiner[i].style.display = 'none';
        }
        position.innerHTML = `${i + 1}º - ${topUsers[i].name}`;
    }
    }

    function showUserMe() {
    let datosRecibidos = false;
    let actualPosition = document.getElementById("actualPosition");
    let position = showTop10();

    for (let i = 0; i < position.length; i++) {
        if (position[i].name === user.name) {
        datosRecibidos = true;
        actualPosition.innerHTML = `${i + 1}`;
        if (datosRecibidos) {
            actualPosition.classList.remove('loading');
        }
        }
    }

    }

    function showCourseInfo() {
    let datosRecibidos = false;
    let coursesData = courseInfo();
    if (coursesData) {
        datosRecibidos = true;
    }
    let courses = document.getElementById("statistic-courses");
    courses.innerHTML = `${coursesData.totalCoursesCompleted} cursos`;

    let time = document.getElementById("statistic-hours");

    coursesData.totalTime = Math.round(coursesData.totalTime / 60);
    time.innerHTML = `${coursesData.totalTime} horas`;

    let average = document.getElementById("statistic-average");
    average.innerHTML = `${coursesData.averageScore} / 10`;

    let lessons = document.getElementById("statistic-units");
    lessons.innerHTML = `${coursesData.totalUnits} lecciones`;

    if (datosRecibidos) {
        courses.classList.remove('loading');
        time.classList.remove('loading');
        average.classList.remove('loading');
        lessons.classList.remove('loading');
    }
    }

    function showMoreCourseInfo() {
    let datosRecibidos = false;
    let longCourseDiv = document.getElementById("course-long");

    longCourse.time = Math.round(longCourse.time / 60);
    datosRecibidos = true;

    longCourse.name = longCourse.name.replace(/-/g, " ");
    longCourseDiv.innerHTML = `${longCourse.name} (Duración Media: ${longCourse.time} horas)`;

    let shortCourseDiv = document.getElementById("course-short");

    shortCourse.time = Math.round(shortCourse.time / 60);
    shortCourse.name = shortCourse.name.replace(/-/g, " ");
    shortCourseDiv.innerHTML = `${shortCourse.name} (Duración Media: ${shortCourse.time} horas)`;

    let courseAbandonedDiv = document.getElementById("course-less-popular");

    courseAbandoned.name = courseAbandoned.name.replace(/-/g, " ");
    courseAbandonedDiv.innerHTML = `${courseAbandoned.name}`;

    let coursePopularDiv = document.getElementById("course-popular")

    coursePopular.name = coursePopular.name.replace(/-/g, " ");
    coursePopularDiv.innerHTML = `${coursePopular.name}`;

    let lowerCourseAverageDiv = document.getElementById("course-less-average")

    lowerCourseAverage.name = lowerCourseAverage.name.replace(/-/g, " ");
    lowerCourseAverageDiv.innerHTML = `${lowerCourseAverage.name} (${lowerCourseAverage.average / 10})`;

    let highestCourseAverageDiv = document.getElementById("course-more-average");

    highestCourseAverage.name = highestCourseAverage.name.replace(/-/g, " ");
    highestCourseAverageDiv.innerHTML = `${highestCourseAverage.name} (${highestCourseAverage.average / 10} )`;

    if (datosRecibidos) {
        longCourseDiv.classList.remove('loading');
        shortCourseDiv.classList.remove('loading');
        courseAbandonedDiv.classList.remove('loading');
        coursePopularDiv.classList.remove('loading');
        lowerCourseAverageDiv.classList.remove('loading');
        highestCourseAverageDiv.classList.remove('loading');
    }

    }

    function showInfoUser() {
    let datosRecibidos = false;
    datosRecibidos = true;
    let userName = document.getElementById('user-info-name');
    let userDate = document.getElementById('user-info-date');

    userName.innerHTML = `${lastUserConected.name}`;
    userDate.innerHTML = `${showDate(lastUserConected.time)}`;

    if (datosRecibidos) {
        userName.classList.remove('loading');
        userDate.classList.remove('loading');
    }
    }

    function filterProgressUser() {
    progressFiltered.totalCourses = progress.length;
    let totalProgress = 0;
    let totalTime = 0;

    for (let i = 0; i < progress.length; i++) {
        if (progress[i].progress_rate > 0 && progress[i].progress_rate < 100) {
        progressFiltered.coursesStarted += 1;
        } else if (progress[i].progress_rate === 100) {
        progressFiltered.completedCourses += 1;
        totalProgress += progress[i].average_score_rate / 10;
        }

        totalTime += progress[i].time_on_course;
        if (progressFiltered.dateLastCourse < progress[i].completed_at) {
        progressFiltered.dateLastCourse = progress[i].completed_at;
        progressFiltered.lastCourse = progress[i].course_id;
        progressFiltered.lastSection = progress[i].progress_per_section_unit[0].section_id;
        }

    }

    progressFiltered.courseProgress = progressFiltered.completedCourses / progressFiltered.totalCourses * 100;
    progressFiltered.courseProgress = Math.round(progressFiltered.courseProgress);

    progressFiltered.averageTotalCourseProgress = totalProgress / progressFiltered.completedCourses;
    progressFiltered.averageTotalCourseProgress = Math.round(progressFiltered.averageTotalCourseProgress);

    progressFiltered.totalTime = totalTime;

    showProgressInfo();
    }

    function showUndefined(text) {
    if (text === undefined) {
        return "No disponible";
    } else {
        return text;
    }
    }
    function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
    }

    document.addEventListener("DOMContentLoaded", functionStart);
}

