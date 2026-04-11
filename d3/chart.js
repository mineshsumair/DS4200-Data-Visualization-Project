const columns = [
  { label: "Spotify", key: "Spotify Streams", color: "#1DB954" },
  { label: "YouTube", key: "YouTube Views", color: "#FF0000" },
  { label: "TikTok", key: "TikTok Views", color: "#a429a2" },
  { label: "Pandora", key: "Pandora Streams", color: "#005483" },
  { label: "SoundCloud", key: "Soundcloud Streams", color: "#FF5500" },
];

const SMALL_SLICE_THRESHOLD = 0.2;

d3.csv("songs_cleaned.csv").then((rows) => {
  const data = columns.map(({ label, key, color }) => ({
    label,
    color,
    value: d3.sum(rows, (row) => +row[key] || 0),
  }));

  const total = d3.sum(data, (d) => d.value);
  const width = 480,
    height = 420,
    radius = Math.min(width, height) / 2 - 50;

  const svg = d3
    .select("#chart")
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

  const pie = d3
    .pie()
    .value((d) => d.value)
    .sort(null)
    .padAngle(0.022);
  const arc = d3.arc().innerRadius(0).outerRadius(radius);
  const labelArc = d3
    .arc()
    .innerRadius(radius * 0.65)
    .outerRadius(radius * 0.65);
  const outerArc = d3
    .arc()
    .innerRadius(radius * 1.1)
    .outerRadius(radius * 1.1);

  svg
    .selectAll("path")
    .data(pie(data))
    .enter()
    .append("path")
    .attr("d", arc)
    .attr("fill", (d) => d.data.color);

  const arcs = pie(data);

  // Inside labels for large slices
  svg
    .selectAll("text.inside")
    .data(arcs)
    .enter()
    .filter((d) => d.endAngle - d.startAngle > SMALL_SLICE_THRESHOLD)
    .append("text")
    .attr("class", "inside")
    .attr("transform", (d) => `translate(${labelArc.centroid(d)})`)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .attr("fill", "#fff")
    .attr("font-size", "13px")
    .text((d) => ((d.data.value / total) * 100).toFixed(1) + "%");

  // Outside labels with leader lines for small slices
  arcs
    .filter((d) => d.endAngle - d.startAngle <= SMALL_SLICE_THRESHOLD)
    .forEach((d) => {
      const posA = arc.centroid(d); // start of line (inside slice)
      const posB = outerArc.centroid(d); // elbow point
      const posC = [...posB]; // end of line
      posC[0] = radius * 1.3 * (posB[0] > 0 ? 1 : -1);
      const anchor = posB[0] > 0 ? "start" : "end";
      const pct = ((d.data.value / total) * 100).toFixed(1) + "%";

      svg
        .append("polyline")
        .attr("points", [posA, posB, posC])
        .attr("fill", "none")
        .attr("stroke", "#999")
        .attr("stroke-width", 1);

      svg
        .append("text")
        .attr("transform", `translate(${posC})`)
        .attr("dy", "0.35em")
        .attr("text-anchor", anchor)
        .attr("font-size", "12px")
        .attr("fill", "#ffffff")
        .text(pct);
    });

  // Legend
  const legend = d3.select("#legend");
  data.forEach((d) => {
    const item = legend.append("span");
    item.append("span").attr("class", "swatch").style("background", d.color);
    item.append("span").text(d.label);
  });
});
