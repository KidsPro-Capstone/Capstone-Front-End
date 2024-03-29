import { configureStore } from "@reduxjs/toolkit";
import createCourseReducer from "./slices/course/createCourseSlice";
import syllabusesReducer from "./slices/syllabus/syllabusesSlice";
import syllabusDetailReducer from "./slices/syllabus/syllabusDetailSlice";
import menuReducer from "./slices/menu/menuSlice";

export default configureStore({
  reducer: {
    createCourse: createCourseReducer,
    syllabuses: syllabusesReducer,
    syllabusDetail: syllabusDetailReducer,
    menu: menuReducer,
  },
});
