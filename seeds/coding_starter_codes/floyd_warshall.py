def floyd_warshall(graph):
    num_nodes = len(graph)
    dist = [[float('inf')] * num_nodes for _ in range(num_nodes)]

    for i in range(num_nodes):
        dist[i][i] = 0

    for u, neighbors in enumerate(graph):
        for v, weight in neighbors.items():
            dist[u][v] = weight

    for k in range(num_nodes):
        for i in range(num_nodes):
            for j in range(num_nodes):
                dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])
    return dist 