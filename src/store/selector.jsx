//createSlice selector
export const createCourseSelector = (state) => state.createCourse.data;

//syllabuses selector
export const syllabusesSelector = (state) => state.syllabuses.data;

//syllabusDetail
export const syllabusDetailSelector = (state) => state.syllabusDetail.data;

//createCourseId
export const createCourseIdSelector = (state) =>
  state.syllabusDetail.data.courseId;

//teacherActiveMenu selector
export const teacherActiveMenuSelector = (state) =>
  state.menu.data.teacherActiveMenu;

//admin active menu
export const adminActiveMenuSelector = (state) =>
  state.menu.data.adminActiveMenu;

//component number
export const componentNumberSelector = (state) => state.componentNumber.data;

//get number of unread notification 
export const numberOfUnreadNotification = (state) => state.notification.data.numberOfUnread;

//get classes
export const classesSelector = (state) => state.classes.data;
