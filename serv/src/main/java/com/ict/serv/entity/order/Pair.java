package com.ict.serv.entity.order;

public class Pair<K, V> {
    private K key;
    private V value;

    // 생성자
    public Pair(K key, V value) {
        this.key = key;
        this.value = value;
    }

    public K getKey() { return key; }
    public V getValue() { return value; }
}