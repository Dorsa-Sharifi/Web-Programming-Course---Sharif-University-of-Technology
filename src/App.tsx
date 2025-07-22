import React, { useState, useRef } from "react";
import "./index.css";

interface Shape {
  id: string;
  type: "circle" | "square" | "triangle";
  x: number;
  y: number;
}

const shapeTypes: Shape["type"][] = ["circle", "square", "triangle"];

const ShapeIcon = ({ type }: { type: Shape["type"] }) => {
  if (type === "circle") return <div className="shape circle" />;
  if (type === "square") return <div className="shape square" />;
  if (type === "triangle") return <div className="shape triangle" />;
  return null;
};

export default function DrawingApp() {
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [paintingName, setPaintingName] = useState("Untitled Painting");
  const [draggingShape, setDraggingShape] = useState<Shape["type"] | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const addShape = (type: Shape["type"], x: number, y: number) => {
    const newShape: Shape = {
      id: crypto.randomUUID(),
      type,
      x,
      y,
    };
    setShapes((prev) => [...prev, newShape]);
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!draggingShape || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    addShape(draggingShape, x, y);
  };

  const handleExport = () => {
    const data = {
      name: paintingName,
      shapes,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${paintingName}.json`;
    link.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        if (data.name && data.shapes) {
          setPaintingName(data.name);
          setShapes(data.shapes);
        }
      } catch (err) {
        alert("Invalid JSON file");
      }
    };
    reader.readAsText(file);
  };

  const removeShape = (id: string) => {
    setShapes((prev) => prev.filter((s) => s.id !== id));
  };

  const shapeCount = shapeTypes.reduce((acc, type) => {
    acc[type] = shapes.filter((s) => s.type === type).length;
    return acc;
  }, {} as Record<Shape["type"], number>);

  return (
    <div className="app">
      <header className="header">
        <input
          className="name-input"
          value={paintingName}
          onChange={(e) => setPaintingName(e.target.value)}
        />
        <div className="buttons">
          <label className="button">
            Import
            <input type="file" accept="application/json" hidden onChange={handleImport} />
          </label>
          <button onClick={handleExport} className="button">
            Export
          </button>
        </div>
      </header>

      <div className="main">
        <aside className="sidebar">
          <h3>Shapes</h3>
          {shapeTypes.map((type) => (
            <div
              key={type}
              draggable
              onDragStart={() => setDraggingShape(type)}
              className="draggable"
            >
              <ShapeIcon type={type} />
            </div>
          ))}
        </aside>

        <div
          ref={canvasRef}
          className="canvas"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          {shapes.map((shape) => (
            <div
              key={shape.id}
              onDoubleClick={() => removeShape(shape.id)}
              className="shape-instance"
              style={{ left: shape.x, top: shape.y }}
            >
              <ShapeIcon type={shape.type} />
            </div>
          ))}
        </div>
      </div>

      <footer className="footer">
        {shapeTypes.map((type) => (
          <div key={type} className="footer-item">
            <ShapeIcon type={type} /> x {shapeCount[type]}
          </div>
        ))}
      </footer>
    </div>
  );
}
