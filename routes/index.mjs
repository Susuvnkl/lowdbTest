import express from "express";
import db from "../db.mjs";
import lowdb from "../lowdb.mjs";

function fetchTodos(req, res, next) {
  // db.all("SELECT * FROM todos WHERE owner_id = ?", [req.user.id], (err, rows) => {
  //   if (err) {
  //     return next(err);
  //   }

  //   const todos = rows.map((row) => ({
  //     id: row.id,
  //     title: row.title,
  //     completed: row.completed == 1 ? true : false,
  //     url: "/" + row.id,
  //   }));
  //   res.locals.todos = todos;
  //   res.locals.activeCount = todos.filter((todo) => !todo.completed).length;
  //   res.locals.completedCount = todos.length - res.locals.activeCount;
  //   next();
  // });
  const todosData = lowdb.data.todos.filter((u) => u.owner_id === req.user.id);
  console.log("test1:", todosData);
  const todos = todosData.map((todo) => ({
    id: todo.id,
    title: todo.title,
    completed: todo.completed == 1 ? true : false,
    url: "/" + todo.id,
  }));
  console.log("test:", todos);
  res.locals.todos = todos;
  res.locals.activeCount = todos.filter((todo) => !todo.completed).length;
  res.locals.completedCount = todos.length - res.locals.activeCount;
  next();
}

const router = express.Router();

/* GET home page. */
router.get(
  "/",
  (req, res, next) => {
    console.log("test index", req.user);
    if (!req.user) {
      return res.render("home");
    }
    next();
  },
  fetchTodos,
  (req, res, next) => {
    res.locals.filter = null;
    res.render("index", { user: req.user });
  }
);

router.get("/active", fetchTodos, (req, res, next) => {
  res.locals.todos = res.locals.todos.filter((todo) => !todo.completed);
  res.locals.filter = "active";
  res.render("index", { user: req.user });
});

router.get("/completed", fetchTodos, (req, res, next) => {
  res.locals.todos = res.locals.todos.filter((todo) => todo.completed);
  res.locals.filter = "completed";
  res.render("index", { user: req.user });
});

router.post(
  "/",
  (req, res, next) => {
    req.body.title = req.body.title.trim();
    next();
  },
  (req, res, next) => {
    if (req.body.title !== "") {
      return next();
    }
    return res.redirect("/" + (req.body.filter || ""));
  },
  async (req, res, next) => {
    // db.run(
    //   "INSERT INTO todos (owner_id, title, completed) VALUES (?, ?, ?)",
    //   [req.user.id, req.body.title, req.body.completed == true ? 1 : null],
    //   (err) => {
    //     if (err) {
    //       return next(err);
    //     }
    //     return res.redirect("/" + (req.body.filter || ""));
    //   }
    // );
    lowdb.data.todos.push({
      id: lowdb.data.todos.length === 0 ? 0 : lowdb.data.todos[lowdb.data.todos.length - 1].id + 1,
      owner_id: req.user.id,
      title: req.body.title,
      completed: req.body.completed == true ? 1 : null,
    });
    await lowdb.write();
    return res.redirect("/" + (req.body.filter || ""));
  }
);
//not done
router.post(
  "/:id(\\d+)",
  (req, res, next) => {
    console.log("test update");
    req.body.title = req.body.title.trim();
    next();
  },
  async (req, res, next) => {
    console.log("test title", req.body.title);
    if (req.body.title !== "") {
      return next();
    }
    console.log("test was clear");
    // db.run(
    //   "DELETE FROM todos WHERE id = ? AND owner_id = ?",
    //   [req.params.id, req.user.id],
    //   (err) => {
    //     if (err) {
    //       return next(err);
    //     }
    //     return res.redirect("/" + (req.body.filter || ""));
    //   }
    // );
    console.log("test delete if clear ", { id: req.params.id, user_id: req.params.id });
    lowdb.data.todos = lowdb.data.todos.filter((todo) => {
      console.log(todo.id === Number(req.params.id) && todo.owner_id === req.user.id);
      // if (todo.id === req.params.id && todo.owner_id === req.user.id) console.log("true");
      return !(todo.id === Number(req.params.id) && todo.owner_id === req.user.id);
    });

    await lowdb.write();
    return res.redirect("/" + (req.body.filter || ""));
  },
  async (req, res, next) => {
    console.log("test wasnt clear");
    // db.run(
    //   "UPDATE todos SET title = ?, completed = ? WHERE id = ? AND owner_id = ?",
    //   [req.body.title, req.body.completed !== undefined ? 1 : null, req.params.id, req.user.id],
    //   (err) => {
    //     if (err) {
    //       return next(err);
    //     }
    //     return res.redirect("/" + (req.body.filter || ""));
    //   }
    // );
    lowdb.data.todos = lowdb.data.todos.map((todo) => {
      console.log("test DIDNT found todo", { todo_id: req.params.id, todo_owner_id: req.user.id });

      if (todo.id === Number(req.params.id) && todo.owner_id === req.user.id) {
        console.log("test found todo");
        // Update the title and completed properties for the specified todo
        return {
          ...todo,
          title: req.body.title,
          completed: req.body.completed !== undefined ? 1 : null,
        };
      }
      return todo;
    });
    await lowdb.write();
    return res.redirect("/" + (req.body.filter || ""));
  }
);

router.post("/:id(\\d+)/delete", async (req, res, next) => {
  // db.run("DELETE FROM todos WHERE id = ? AND owner_id = ?", [req.params.id, req.user.id], (err) => {
  //   if (err) {
  //     return next(err);
  //   }
  //   return res.redirect("/" + (req.body.filter || ""));
  // });
  console.log("test now ", { id: req.params.id, user_id: req.params.id });
  lowdb.data.todos = lowdb.data.todos.filter((todo) => {
    console.log(todo.id === Number(req.params.id) && todo.owner_id === req.user.id);
    // if (todo.id === req.params.id && todo.owner_id === req.user.id) console.log("true");
    return !(todo.id === Number(req.params.id) && todo.owner_id === req.user.id);
  });

  await lowdb.write();
  return res.redirect("/" + (req.body.filter || ""));
});

router.post("/toggle-all", async (req, res, next) => {
  console.log("test all");
  // db.run(
  //   "UPDATE todos SET completed = ? WHERE owner_id = ?",
  //   [req.body.completed !== undefined ? 1 : null, req.user.id],
  //   (err) => {
  //     if (err) {
  //       return next(err);
  //     }
  //     return res.redirect("/" + (req.body.filter || ""));
  //   }
  // );
  lowdb.data.todos = lowdb.data.todos.map((todo) => {
    if (todo.owner_id === req.user.id) {
      return {
        ...todo,
        completed: req.body.completed !== undefined ? 1 : null,
      };
    }
    return todo;
  });
  await lowdb.write();
  return res.redirect("/" + (req.body.filter || ""));
});

router.post("/clear-completed", async (req, res, next) => {
  // db.run("DELETE FROM todos WHERE owner_id = ? AND completed = ?", [req.user.id, 1], (err) => {
  //   if (err) {
  //     return next(err);
  //   }
  //   return res.redirect("/" + (req.body.filter || ""));
  // });
  lowdb.data.todos = lowdb.data.todos.filter((todo) => {
    return !(todo.owner_id === req.user.id && todo.completed === 1);
    // console.log("test found todo");
    // return {
    //   ...todo,
    //   completed: req.body.completed !== undefined ? 1 : null,
    // };

    // return todo;
  });
  await lowdb.write();
  return res.redirect("/" + (req.body.filter || ""));
  // lowdb.data.todos = lowdb.data.todos.filter((todo) => {
  //   console.log(todo.id === Number(req.params.id) && todo.owner_id === req.user.id);
  //   // if (todo.id === req.params.id && todo.owner_id === req.user.id) console.log("true");
  //   return !(todo.id === Number(req.params.id) && todo.owner_id === req.user.id);
  // });

  // await lowdb.write();
  // return res.redirect("/" + (req.body.filter || ""));
});

export default router;
