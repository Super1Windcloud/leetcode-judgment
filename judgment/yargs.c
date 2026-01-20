#include <errno.h>
#include <fcntl.h>
#include <unistd.h>
#include <stdbool.h>
#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include <sys/stat.h>
#include <sys/types.h>

#define INITIAL_ARGS_CAPACITY 64
#define READ_BUFFER_SIZE 4096

int main(int argc, char *argv[]) {
    if (argc < 4) {
        fprintf(stderr, "Usage: %s <replace_str> <file_path> <program> [args...]\n", argv[0]);
        return 1;
    }

    const char *replace_string = argv[1];
    const char *file_name = argv[2];
    const char *program = argv[3];

    // 1. 读取配置文件内容
    int fd = open(file_name, O_RDONLY);
    if (fd < 0) {
        perror("yargs: open");
        return 1;
    }

    char *file_buf = NULL;
    size_t file_size = 0;
    size_t file_capacity = 0;

    while (1) {
        if (file_size + READ_BUFFER_SIZE > file_capacity) {
            file_capacity += READ_BUFFER_SIZE * 4;
            char *new_buf = realloc(file_buf, file_capacity);
            if (!new_buf) {
                perror("yargs: realloc file_buf");
                free(file_buf);
                close(fd);
                return 1;
            }
            file_buf = new_buf;
        }

        ssize_t n = read(fd, file_buf + file_size, READ_BUFFER_SIZE);
        if (n < 0) {
            perror("yargs: read");
            free(file_buf);
            close(fd);
            return 1;
        }
        if (n == 0) break;
        file_size += n;
    }
    close(fd);

    // 2. 准备执行参数数组
    size_t args_capacity = INITIAL_ARGS_CAPACITY + argc;
    char **args = malloc(args_capacity * sizeof(char *));
    if (!args) {
        perror("yargs: malloc args");
        return 1;
    }

    size_t args_count = 0;
    args[args_count++] = (char *)program;

    bool replaced = false;
    for (int i = 4; i < argc; i++) {
        if (!replaced && strcmp(argv[i], replace_string) == 0) {
            replaced = true;
            // 将文件内容拆分为多个参数（按 \0 分隔）
            size_t start = 0;
            for (size_t j = 0; j < file_size; j++) {
                if (file_buf[j] == '\0') {
                    // 确保数组够大
                    if (args_count + 2 >= args_capacity) {
                        args_capacity *= 2;
                        args = realloc(args, args_capacity * sizeof(char *));
                        if (!args) {
                            perror("yargs: realloc args");
                            return 1;
                        }
                    }
                    args[args_count++] = &file_buf[start];
                    start = j + 1;
                }
            }
        } else {
            if (args_count + 2 >= args_capacity) {
                args_capacity *= 2;
                args = realloc(args, args_capacity * sizeof(char *));
                if (!args) {
                    perror("yargs: realloc args");
                    return 1;
                }
            }
            args[args_count++] = argv[i];
        }
    }

    args[args_count] = NULL; // 结尾必须是 NULL

    // 3. 执行程序
    execvp(program, args);
    
    // 如果执行到这里，说明失败了
    perror("yargs: execvp");
    return 1;
}