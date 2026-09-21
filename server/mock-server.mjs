import { createServer } from "node:http";

let profile = {
  username: "Maxim",
  weight: 80,
  height: 180,
  gender: "mies",
  goal: "healthy",
  diets: ["vegetarian"],
  nutrition: {
    calories: 2500,
    protein: 160,
    fat: 70,
    carbs: 280,
  },
};

const server = createServer((request, response) => {
  if (request.url !== "/api/profile") {
    response.writeHead(404);
    response.end();
    return;
  }

  response.setHeader("Content-Type", "application/json");
  response.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  response.setHeader("Access-Control-Allow-Methods", "GET, PUT, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (request.method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }

  if (request.method === "GET") {
    response.writeHead(200);
    response.end(JSON.stringify(profile));
    return;
  }

  if (request.method === "PUT") {
    let body = "";
    request.on("data", (chunk) => { body += chunk; });
    request.on("end", () => {
      try {
        profile = JSON.parse(body);
        response.writeHead(200);
        response.end(JSON.stringify(profile));
      } catch {
        response.writeHead(400);
        response.end(JSON.stringify({ error: "Invalid JSON" }));
      }
    });
    return;
  }

  response.writeHead(405);
  response.end();
});

server.listen(8080, () => {
  console.log("Profile demo API running at http://localhost:8080/api/profile");
});